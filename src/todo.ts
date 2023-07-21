//TODO: Refactor the interface Device into DeviceInterface and create a class Device 
//      The Device class should have the following: 
//      FUNCTIONS:
//            ToJson():string;
//         static Device.FromJson(json:string): Device;
//         createConfig(): string # use this following functions
//              createConfigComments():string
//              createConfigSubstitutions():string
//              createConfigTail():string
//         static Device.GetEmptyDevice(pos:int): Device;
//      PROPERTIES:
//         device_id: string
//         device_name: string
//         device_area: string;
//         device_config: string; (getDeviceConfig => createConfig())
//         device_entities: Record<string, Entidade>;
//         light_entity_id: string (get/set)
//         control_type: string (get/set)
//         panel_name: string (get/set)
//         button_pos: int (get/set)
//         control_list: string (get/set)
//         comment: string (get/set)

substitutions:
  
  control_type: "disabled"
  isRelayDisabled: "false"
  panel_name: "0"
  button_pos: "0"
  control_list: "0"
  comment: "luz_sala | noControl"

// Interface para definir a estrutura dos dados
// interface DeviceInterface {
//     // Coloque aqui os atributos que a classe Device terá
//     propriedade1: string;
//     propriedade2: number;
//     // Outros atributos, métodos, etc.
  
//     // Declaração do dicionário
//     dicionario: Record<string, Entidade>;
//   }
  
//   // Definição da interface Entidade (substitua por sua própria definição)
//   interface Entidade {
//     // Atributos e métodos da Entidade
//     id: number;
//     nome: string;
//     // Outros atributos e métodos, se necessário
//   }
  
//   // Classe Device
//   class Device implements DeviceInterface {
//     propriedade1: string;
//     propriedade2: number;
//     dicionario: Record<string, Entidade>; // Declaração do dicionário na classe
  
//     constructor(prop1: string, prop2: number) {
//       this.propriedade1 = prop1;
//       this.propriedade2 = prop2;
//       this.dicionario = {}; // Inicializa o dicionário vazio
//     }
  
//     // Outros métodos e lógica da classe
//   }
  
//   // Exemplo de uso:
//   const dispositivo: DeviceInterface = new Device("Exemplo", 42);
//   dispositivo.dicionario["chave1"] = { id: 1, nome: "Entidade 1" };
//   dispositivo.dicionario["chave2"] = { id: 2, nome: "Entidade 2" };
  
//   console.log(dispositivo.dicionario["chave1"]); // Output: { id: 1, nome: "Entidade 1" }
//   console.log(dispositivo.dicionario["chave2"]); // Output: { id: 2, nome: "Entidade 2" }
  





// TODO: ajustar interface
//TODO: Usar fastapi para executar os programas de shell:
    // esphome => compilar e enviar o firmware via OTA
    //  hass-cli => atualizar localização do dispositivo
    // hass-cli => recuperar localização do dispositivo
// TODO: criar campo localização, nome painel, botão gravar (grava o campo panel_name e button_pos em todos botões)


