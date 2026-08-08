import assert from "node:assert/strict";
import test from "node:test";

import { classifyMql, tallyMql } from "../src/data-pipeline/mql-classifier";

function isMql(role: string, strict = false): boolean {
  return classifyMql(role, { strict }).classification === "MQL";
}

test("dono/decisor e profissao liberal viram MQL", () => {
  for (const role of [
    "Empresária",
    "empresario",
    "Proprietário de clínica",
    "Sócia",
    "Diretor comercial",
    "Gerente",
    "Advogada",
    "Médico",
    "Engenheiro civil",
    "CEO",
    "Dona de empresa",
  ]) {
    assert.ok(isMql(role), `deveria ser MQL: ${role}`);
  }
});

test("cargo operacional e sem sinal financeiro viram NAO MQL", () => {
  for (const role of [
    "Professora",
    "Do lar",
    "Aposentada",
    "Secretária",
    "Motorista",
    "Diarista",
    "Atendente",
    "Auxiliar administrativo",
    "Cozinheira",
    "Estudante",
    "Desempregado",
    "Enfermeira",
  ]) {
    assert.ok(!isMql(role), `deveria ser NAO MQL: ${role}`);
  }
});

test("SABOTAGEM: substring nao pode confundir cargo operacional com executivo", () => {
  // O bug da primeira versao: "coo" casava "coordenador", "socia" casava
  // "assistente social". O match por palavra tem que rejeitar os dois.
  assert.ok(!isMql("Coordenador de loja"), "coordenador nao e COO");
  assert.ok(!isMql("Assistente social"), "assistente social nao e socia");
  assert.ok(!isMql("Sociólogo"), "sociologo nao e socio");
  assert.ok(!isMql("Cerimonialista"), "cerimonialista nao e CEO");
});

test("sinal forte ganha de termo operacional no mesmo cargo", () => {
  // "medica aposentada": a profissao decide, nao a situacao.
  assert.ok(isMql("Médica aposentada"));
  assert.ok(isMql("Empresário aposentado"));
});

test("cargo vazio ou lixo e NAO MQL, nunca MQL", () => {
  for (const junk of ["", ".", "-", "sim", "0", "x", null, undefined]) {
    const verdict = classifyMql(junk);
    assert.equal(verdict.classification, "NAO_MQL");
    assert.equal(verdict.reason, "cargo_vazio");
  }
});

test("cargo desconhecido cai em NAO MQL por 'sem sinal', na duvida", () => {
  const verdict = classifyMql("Malabarista de circo itinerante");
  assert.equal(verdict.classification, "NAO_MQL");
  assert.equal(verdict.reason, "sem_sinal");
});

test("a variante estrita remove medico e engenheiro", () => {
  assert.ok(isMql("Médico"), "no padrao, medico e MQL");
  assert.ok(!isMql("Médico", true), "no estrito, medico sai");
  assert.ok(isMql("Engenheiro"), "no padrao, engenheiro e MQL");
  assert.ok(!isMql("Engenheiro", true), "no estrito, engenheiro sai");
  // Dono continua MQL nas duas reguas.
  assert.ok(isMql("Dono", true));
});

test("o veredito e auditavel: aponta o termo que decidiu", () => {
  assert.equal(classifyMql("Empresária").matched, "empresari");
  assert.equal(classifyMql("CEO").matched, "ceo");
  assert.equal(classifyMql("Professora").matched, "professor");
});

test("tally soma MQL, NAO MQL e o total sem perder ninguem", () => {
  const roles = ["Empresária", "Professora", "CEO", "Do lar", "Sócio", ""];
  const t = tallyMql(roles);
  assert.equal(t.total, 6);
  assert.equal(t.mql, 3);
  assert.equal(t.naoMql, 3);
  assert.equal(t.mql + t.naoMql, t.total);
  assert.equal(t.byMatch["empresari"], 1);
});

test("a regua estrita nunca classifica MAIS que o padrao", () => {
  const roles = ["Médico", "Engenheiro", "Empresária", "Dentista", "Professora"];
  const padrao = tallyMql(roles).mql;
  const estrito = tallyMql(roles, { strict: true }).mql;
  assert.ok(estrito <= padrao);
});
