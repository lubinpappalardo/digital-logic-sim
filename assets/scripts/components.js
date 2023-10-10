const components = {
    TEXT: `
  <div class='component text' id=''>
    <input type='text' class='input' size='1'/>
  </div>
    `,
    LIGHT: `
  <div class='component light' id=''>
    <div class='in-pins'>
        <span class='pin input'></span>
    </div>
  </div> 
    `,
    SWITCH: `
  <div class='component switch' id=''>
    <div class='out-pins'>
        <span class='pin output'></span>
    </div>
  </div> 
    `,
    BUFFER: `
  <div class='component buffer' id=''>
    <div class='tooltip'>BUFFER</div>
    <div class='in-pins'>
        <span class='pin input1'></span>
    </div>
    <div class='out-pins'>
        <span class='pin output1'></span>
    </div>
  </div>
    `,
    NOT: `
  <div class='component not' id=''>
    <div class='tooltip'>NOT</div>
    <div class='in-pins'>
        <span class='pin input1'></span>
    </div>
    <div class='out-pins'>
        <span class='pin output1'></span>
    </div>
  </div>
    `,
    AND: `
  <div class='component and' id=''>
    <div class='tooltip'>AND</div>
    <div class='in-pins'>
        <span class='pin input1'></span>
        <span class='pin input2'></span>
    </div>
    <div class='out-pins'>
        <span class='pin output1'></span>
    </div>
  </div>
    `,
    NAND: `
  <div class='component nand' id=''>
    <div class='tooltip'>NAND</div>
    <div class='in-pins'>
        <span class='pin input1'></span>
        <span class='pin input2'></span>
    </div>
    <div class='out-pins'>
        <span class='pin output1'></span>
    </div>
  </div>
    `,
    OR: `
  <div class='component or' id=''>
    <div class='tooltip'>OR</div>
    <div class='in-pins'>
        <span class='pin input1'></span>
        <span class='pin input2'></span>
    </div>
    <div class='out-pins'>
        <span class='pin output1'></span>
    </div>
  </div>
    `,
    NOR: `
  <div class='component nor' id=''>
    <div class='tooltip'>NOR</div>
    <div class='in-pins'>
        <span class='pin input1'></span>
        <span class='pin input2'></span>
    </div>
    <div class='out-pins'>
        <span class='pin output1'></span>
    </div>
  </div>
    `,
    XOR: `
  <div class='component xor' id=''>
    <div class='tooltip'>XOR</div>
    <div class='in-pins'>
        <span class='pin input1'></span>
        <span class='pin input2'></span>
    </div>
    <div class='out-pins'>
        <span class='pin output1'></span>
    </div>
  </div>
    `,
    XNOR: `
  <div class='component xnor' id=''>
    <div class='tooltip'>XNOR</div>
    <div class='in-pins'>
        <span class='pin input1'></span>
        <span class='pin input2'></span>
    </div>
    <div class='out-pins'>
        <span class='pin output1'></span>
    </div>
  </div>
    `,
  }