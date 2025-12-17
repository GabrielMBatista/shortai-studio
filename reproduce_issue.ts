
import { extractProjectTitle, extractProjectDescription } from './src/utils/projectUtils';

const json1 = `{"titulo":"Oração: Bênção da Semana","hook_falado":"Senhor, abençoa a semana que vai começar.","scenes":[{"scene":1,"visual":"Jesus de pé com as mãos estendidas sobre uma estrada ou caminho (5s).","narration":"Senhor, abençoa a semana que vai começar. Que cada passo seja guiado por Ti.","visualDescription":"Jesus de pé com as mãos estendidas sobre uma estrada ou caminho (5s).","sceneNumber":1},{"scene":2,"visual":"Jesus abrindo portas que estavam fechadas (5s).","narration":"Abre as portas de emprego, de cura e de oportunidades.","visualDescription":"Jesus abrindo portas que estavam fechadas (5s).","sceneNumber":2},{"scene":3,"visual":"Jesus colocando um escudo invisível à frente da câmera (5s).","narration":"Livra-nos de todo mal, de todo laço e de toda palavra contrária.","visualDescription":"Jesus colocando um escudo invisível à frente da câmera (5s).","sceneNumber":3},{"scene":4,"visual":"Céu amanhecendo com cores vivas (5s).","narration":"Que seja uma semana de vitórias surpreendentes e notícias boas.","visualDescription":"Céu amanhecendo com cores vivas (5s).","sceneNumber":4},{"scene":5,"visual":"Jesus sorrindo e dando um 'joinha' ou sinal positivo (6s).","narration":"Eu creio. Você crê? Digite 'Eu creio' e receba.","visualDescription":"Jesus sorrindo e dando um 'joinha' ou sinal positivo (6s).","sceneNumber":5}],"topic":"Oração: Bênção da Semana","_folderName":"Semana 23 29 Dez 2025 Natal OraçõEsAbertas","_subFolderName":"Domingo"}`;

console.log("--- Test Results ---");
console.log("Input JSON Length:", json1.length);
const title = extractProjectTitle(json1);
const desc = extractProjectDescription(json1);

console.log("Extracted Title:", title);
console.log("Extracted Description:", desc);

if (desc.includes("Senhor, abençoa a semana que vai começar")) {
    console.log("SUCCESS: Description synthesized correctly.");
} else {
    console.log("FAILURE: Description empty or generic.");
}
