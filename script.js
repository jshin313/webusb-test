const ENDPOINTIN = 0x1;
const ENDPOINTOUT = 0x2;

document.getElementById('triggerButton').addEventListener('click', function () {
    if (navigator.usb) {
        connect();
    } else {
        alert('WebUSB not supported.');
    }
});

async function requestBufferSize(device) {

    // create a TypedArray with a size in bytes
    // const data = new Uint8Array([0x00, 0x00, 0x00, 0x10, 0x04, 0x00, 0x00, 0x00, 0x0A, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x07, 0xD0]);
    const data = new Uint8Array([0x00, 0x00, 0x00, 0x04, 0x01, 0x00, 0x00, 0x04, 0x00]);

    // console.log("Bulk out: " + data);

    device.transferOut(ENDPOINTOUT, data);

    // Ready to receive data
    let result = await device.transferIn(ENDPOINTIN, 9)
    // console.log("Result");
    // console.log(result);
    var arrayBuffer = result.data.buffer;
    var uint8View = new Uint8Array(arrayBuffer);
    console.log(uint8View);

}

async function connect() {
    try {

        // Prompt user to choose device
        let device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x0451 }] });

        // console.log(device);
        // Product Name
        console.log("Product Name: " + device.productName);
        // Manufacturer Name
        console.log("Manufacturer: " + device.manufacturerName);

        await device.open(); // Begin a session.



        // Select configuration #1 for the device, 
        // since that appears to be the active configuration
        await device.selectConfiguration(1); 

        console.log(device);

        // Request exclusive control over interface #0
        await device.claimInterface(0); 

        requestBufferSize(device);

    } catch (error) {
        document.getElementById('target').innerHTML = error;
    }
}
