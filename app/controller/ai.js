import {openai} from "../../config/openAI.js";
import {InternalError} from "../utils/request_error.js";

/**
 * @swagger
 * tags:
 *   name: AI Chat
 *   description: Routes for AI Chat functionality
 */

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Get AI Chat responses
 *     tags: [AI Chat]
 *     requestBody:
 *       description: Request body for AI Chat
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     content:
 *                       type: string
 *               prompt:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful response with AI Chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                       content:
 *                         type: string
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /ai/workflow:
 *   post:
 *     summary: Get AI Workflow responses
 *     tags: [AI Chat]
 *     requestBody:
 *       description: Request body for AI Workflow
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *               nodes:
 *                 type: object
 *               workflow:
 *                 type: object
 *     responses:
 *       '200':
 *         description: Successful response with AI Workflow result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '500':
 *         description: Internal Server Error
 */

let startMessage = "Tu es un assistant qui va aider les utilisateurs qui font te poser des questions." +
  "sur l'application linkease. Linkease est un projet visant à créer une plateforme de type IFTTT, mais avec une approche plus technique et axée sur la communauté. L'objectif est d'intégrer des éléments communautaires tels que le partage de workspaces (espaces de travail) et d'automates, ainsi que des forums pour poser des questions et offrir de l'aide aux utilisateurs, en particulier ceux moins à l'aise avec la programmation.\n" +
  "\n" +
  "Vocabulaire\n" +
  "Automate : Un automate est similaire à une applet sur IFTTT, mais avec une complexité accrue. Il intègre des systèmes de variables et d'autres fonctionnalités avancées.\n" +
  "\n" +
  "Workspace : Un workspace est un espace partagé entre plusieurs utilisateurs, permettant le travail d'équipe. Il contient des automates créés par l'équipe."

let ruleWorkflow = "Je veux que tu agis sur le workflow qui est un workflow reactflow en fonction de l'action de l'utilisateur." +
  "Tu recevras un json Nodes qui sont les nodes disponibles pour l'utilisateur et ensuite un json du workflow de l'utilisateur." +
  "Tu dois toujours renvoyer tout le json du workflow de l'utilisateur modifié et pas le json Nodes !" +
  "Nodes :\n"

export default function index(app) {
  app.post('/ai/chat', async (request, response) => {
    try {
      let messages = request.body.messages;
      if (messages.length <= 1)
        messages.unshift({"role": "system", "content": startMessage})
      const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-3.5-turbo"
      })
      messages.push({"role": "assistant", "content": completion.choices[0].message.content})
      return response.status(200).json({messages})
    } catch (e) {
      console.log(e)
      InternalError(response)
    }
  })
  app.post("/ai/workflow", async (request, response) => {
    try {
      let prompt = request.body.prompt;
      let nodes = JSON.stringify(request.body.nodes);
      let workflow = JSON.stringify(request.body.workflow);
      let messages = [];

      messages.unshift({"role": "system", "content": ruleWorkflow + nodes + "\nworkflow:\n" + workflow })
      messages.unshift({"role": "user", "content": prompt})
      const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-3.5-turbo-1106",
        response_format: { type: "json_object" }
      })
      return response.status(200).json(JSON.parse(completion.choices[0].message.content))
    } catch (e) {
      console.log(e)
      InternalError(response)
    }
  })
}