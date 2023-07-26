export interface EntityInterface {
    entity_id: string;
    state: string;
    attributes: {
      [key: string]: any;
    };
    last_changed: string;
    last_updated: string;   
}
export function emptyEntityInterface():EntityInterface {
  return {
    entity_id: '',
    state: '',
    attributes: {},
    last_changed: '',
    last_updated: '' 
  }
}

export class Entity implements EntityInterface {
    public entity_id: string;
    public state: string;
    public attributes: { [key: string]: any };
    public last_changed: string;
    public last_updated: string;
  constructor(entity: EntityInterface ){
    this.entity_id = entity.entity_id;
    this.state = entity.state;
    this.attributes = entity.attributes;
    this.last_changed = entity.last_changed;
    this.last_updated = entity.last_updated;
  }

    static emptyEntity(entityId:string, entityState:string ='' ){
        return new Entity({entity_id: entityId,state: entityState, attributes: [], last_changed: '', last_updated: ''});
    }
}