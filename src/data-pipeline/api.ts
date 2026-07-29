import type { Express, NextFunction, Request, Response } from "express";
import multer from "multer";

import { PipelineRejectedError, processWorkbooks } from "./pipeline";
import { assertPublishReady, publishSnapshot } from "./publish";
import {
  activateResult,
  listHistory,
  rollbackLatest,
  saveCandidate,
} from "./store";
import { createWorkbookInput } from "./workbooks";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
    fileSize: 40 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    callback(null, /\.(xlsx|xlsm|xls)$/i.test(file.originalname));
  },
});

export function registerDataPipelineRoutes(app: Express): void {
  app.post(
    "/api/imports",
    upload.array("files", 5),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const files = (request.files ?? []) as Express.Multer.File[];
        const inputs = files.map((file) =>
          createWorkbookInput(file.originalname, file.buffer),
        );
        const result = processWorkbooks(inputs);
        await saveCandidate(result);

        const shouldActivate = request.body?.activate !== "false";
        const shouldPublish =
          shouldActivate &&
          request.body?.publish !== "false" &&
          process.env.DASHBOARD_AUTO_PUBLISH === "true";
        if (shouldPublish) {
          assertPublishReady();
        }
        if (shouldActivate) {
          await activateResult(result);
        }
        const publishedToGit = shouldPublish
          ? publishSnapshot(result.snapshot.importId)
          : false;

        response.status(shouldActivate ? 201 : 200).json({
          status: publishedToGit
            ? "PUBLISHED_GITHUB"
            : shouldActivate
              ? "PUBLISHED_LOCAL"
              : "APPROVED",
          publishedToGit,
          importId: result.snapshot.importId,
          primaryPeriod: result.snapshot.primaryPeriod,
          sources: result.snapshot.sources.map((source) => ({
            role: source.role,
            period: source.period,
            records: source.records,
          })),
          issues: result.snapshot.validation.issues,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.get("/api/imports/history", async (_request, response, next) => {
    try {
      response.json({ imports: await listHistory() });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/imports/rollback", async (_request, response, next) => {
    try {
      const result = await rollbackLatest();
      response.json({
        status: "ROLLED_BACK",
        importId: result.snapshot.importId,
      });
    } catch (error) {
      next(error);
    }
  });

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      if (error instanceof PipelineRejectedError) {
        response.status(422).json({
          status: "REJECTED",
          issues: error.issues,
        });
        return;
      }
      if (error instanceof multer.MulterError) {
        response.status(400).json({
          status: "REJECTED",
          issues: [
            {
              severity: "CRITICAL",
              code: "UPLOAD_INVALID",
              message: error.message,
            },
          ],
        });
        return;
      }
      response.status(500).json({
        status: "ERROR",
        message: "Falha interna ao processar a importacao.",
      });
    },
  );
}
