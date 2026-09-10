// import { HttpService } from '@nestjs/axios';
// import { firstValueFrom } from 'rxjs';
// import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
// import { Question } from '../../question/entities/question.entity';

// @EventSubscriber()
// export class QuestionSubscriber implements EntitySubscriberInterface<Question> {

//   listenTo(): any {
//     return Question;//Escucha solo los eventos relacionados con la entidad Question
//   }

//   async afterInsert(event: InsertEvent<Question>): Promise<any> {
//     if(typeof process.env.ALLOW_LOG_REGISTER !== undefined){
//       if(process.env.ALLOW_LOG_REGISTER==='true'){
//         const httpService = new HttpService();

//         const response = await firstValueFrom(httpService.post(process.env.TRANSACTION_ENDPOINT, {
//           "old_data" : "",
//           "new_data": {
//           "contexto": event.entity.contexto,
//           "enunciado": event.entity.enunciado,
//           "opcionesRespuesta": event.entity.opcionesRespuesta
//           },
//           "type_transaction": "insert",
//           "transaction_date": new Date,
//           "entity": "Question",
//           "application_name": "enlazaa-test-factory"
//         }));

//         return response;
//       }
//     }
//   };

//   async afterUpdate(event: UpdateEvent<Question>): Promise<any> {//Funciona cuando se cambia el enunciado de Question
//     if(typeof process.env.ALLOW_LOG_REGISTER !== undefined){
//       if(process.env.ALLOW_LOG_REGISTER==='true'){
//         const httpService = new HttpService();
        
//         const response = await firstValueFrom(httpService.post(process.env.TRANSACTION_ENDPOINT, {
//             "old_data" : {
//               "contexto": event.databaseEntity.contexto,
//               "enunciado": event.databaseEntity.enunciado,
//               "opcionesRespuesta": event.databaseEntity.opcionesRespuesta
//             },
//             "new_data": {
//               "contexto": event.entity.contexto,
//               "enunciado": event.entity.enunciado,
//               "opcionesRespuesta": event.entity.opcionesRespuesta
//             },
//             "type_transaction": "update",
//             "transaction_date": new Date,
//             "entity": "Question",
//             "application_name": "enlazaa-test-factory"
//           }));

//         return response;
//       }
//     } 
//   }
// }