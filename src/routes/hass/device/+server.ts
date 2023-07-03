import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import {buildDeviceObj} from '$lib/server/hassfunctions';


import type { Device, Entity } from '$lib/hassinterfaces';


export async function POST({ request }) {
    const { entityId } = await request.json();
    const result = await buildDeviceObj(entityId);
    return json(result);
}