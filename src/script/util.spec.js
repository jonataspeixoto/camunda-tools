import { getProcessDefinitionFromUrl, getProcessInstanceFromUrl } from "./util";

describe("Testes para funções de obtenção de ID a partir da URL", () => {
  test("Deve extrair corretamente o ID da instância do processo da URL", () => {
    const url =
      "https://exemplo.com/camunda/app/cockpit/default/#/process-instance/0064c1eb-7dc0-11ee-a055-92a07d61899b/runtime";
    const processInstanceID = getProcessInstanceFromUrl(url);
    expect(processInstanceID).toBe("0064c1eb-7dc0-11ee-a055-92a07d61899b");
  });

  test("Deve retornar uma string vazia se a URL da instância do processo for inválida", () => {
    const url = "https://exemplo.com/outra-rota";
    const processInstanceID = getProcessInstanceFromUrl(url);
    expect(processInstanceID).toBe("");
  });

  test("Deve extrair corretamente o ID da definição do processo da URL", () => {
    const url =
      "https://exemplo.com/camunda/app/cockpit/default/#/process-definition/CANCELLATION:23:f9448da4-7da1-11ee-a055-92a07d61899b/runtime";
    const processDefinitionID = getProcessDefinitionFromUrl(url);
    expect(processDefinitionID).toBe("CANCELLATION:23:f9448da4-7da1-11ee-a055-92a07d61899b");
  });

  test("Deve retornar uma string vazia se a URL da definição do processo for inválida", () => {
    const url = "https://exemplo.com/outra-rota";
    const processDefinitionID = getProcessDefinitionFromUrl(url);
    expect(processDefinitionID).toBe("");
  });
});
