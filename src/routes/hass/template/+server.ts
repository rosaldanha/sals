import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import {log,error} from '$lib/logger';


async function getTemplateResolved(templateStr:string) {
    let jsonResult: any = null;
    log(env.PUBLIC_ACCESSTOKEN);
    try {
        // Monta o objeto de dados para a requisição
        const dataForBody = {
          template: templateStr,
        };    
        // Faz a requisição POST para executar o template
        const response = await fetch(`${env.PUBLIC_HOMEASSISTANT_URL}/api/template`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',            
            Authorization: `Bearer ${env.PUBLIC_ACCESSTOKEN}`,
          },
          //mode:'no-cors',
          body: JSON.stringify(dataForBody),
        });
    
        if (!response.ok) {
          throw new Error('Erro na requisição: ' + response.status);
        }
        jsonResult = await response.json();   
        
    }
    catch(e){
        error(e);
    }
    return jsonResult;
}


export async function POST({ request }) {
    const { templateStr } = await request.json();
    const result = await getTemplateResolved(templateStr);
    return json(result);
}