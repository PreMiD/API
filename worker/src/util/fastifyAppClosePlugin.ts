import { FastifyInstance } from "fastify";

export default function fastifyAppClosePlugin(app: FastifyInstance) {
	return {
		async serverWillStart() {
			return {
				async drainServer() {
					await app.close();
				}
			};
		}
	};
}
