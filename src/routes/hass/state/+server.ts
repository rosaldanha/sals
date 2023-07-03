import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

import type { Entity } from '$lib/hassinterfaces';
import {log,error} from '$lib/logger';


async function getEntityState(entityId:string){
    let entityState: Entity = {
        entity_id:'',
        state: '',
        attributes: {},
        last_changed: '',
        last_updated: ''
    };
    try {
        const urlForState = `${env.PUBLIC_HOMEASSISTANT_URL}/api/states/${entityId}`;        
        const response = await fetch(urlForState, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '',
              Authorization: `Bearer ${env.PUBLIC_ACCESSTOKEN}`,
            },
            //mode:'no-cors',
          });
        entityState = await response.json();

    } catch (e) {
         error(e);
    }
    return entityState;
}



export async function POST({ request }) {
    const { entityId } = await request.json();
    const result = await getEntityState(entityId);
    return json(result);
}