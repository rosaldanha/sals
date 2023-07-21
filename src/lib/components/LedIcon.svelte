<script>
    export let color = 'red'; // Cor padrão do LED
  </script>
  
  <style>
  .led-container {
    display: inline-block;
    margin: 5px;
    position: relative;
  }

  .led {
    width: 15px;
    height: 15px;
    border-radius: 50%;   
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  }

  .led:before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    z-index: -1;
  }
  </style>  


  <div class="led-container">
    <div class="led"  style="background-color: {color};"></div>
  </div>
  