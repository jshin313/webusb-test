const ENDPOINTIN = 0x1;
const ENDPOINTOUT = 0x2;
var MAXPACKETLEN = 0;

document.getElementById('triggerButton').addEventListener('click', function () {
    if (navigator.usb) {
        connect();
    } else {
        alert('WebUSB not supported.');
    }
});

async function sendVirtualFinal(device, virtualdata, virtualtype) {

    // Perform check to make sure max packet size is not exceeded
    // Length of virtual packet virtualdata + length of virtual packet header
    if (virtualdata.length + 6 > MAXPACKETLEN) {
        throw "Packet size of " + virtualdata.length + " is too larger than " + MAXPACKETLEN;
    }

    rawHeader = new Array(5); 
    rawHeader[0] = (virtualdata.length + 6) >> 24 & 0xff;
    rawHeader[1] = (virtualdata.length + 6) >> 16 & 0xff;
    rawHeader[2] = (virtualdata.length + 6) >> 8 & 0xff;
    rawHeader[3] = (virtualdata.length + 6) & 0xff;

    // Virtual Final
    rawHeader[4] = 0x04;

    console.log("Raw Header: " + rawHeader);

    var virtualHeader = new Array(6);

    virtualHeader[0] = virtualdata.length >> 24 & 0xff;
    virtualHeader[1] = virtualdata.length >> 16 & 0xff;
    virtualHeader[2] = virtualdata.length >> 8 & 0xff;
    virtualHeader[3] = virtualdata.length & 0xff;

    virtualHeader[4] = virtualtype >> 8 & 0xff;
    virtualHeader[5] = virtualtype & 0xff;

    console.log("Virtual Header: " + virtualHeader);
    console.log(virtualdata);

    var data = new Uint8Array(rawHeader.concat(virtualHeader.concat(virtualdata)));

    console.log("Bulk Out: " + data);
    device.transferOut(ENDPOINTOUT, data);

    // Ready to receive data
    let result = await device.transferIn(ENDPOINTIN, 64);
    console.log("Result");
    console.log(result);
    var arrayBuffer = result.data.buffer;
    console.log(arrayBuffer);
    var uint8View = new Uint8Array(arrayBuffer);
    console.log(uint8View);
    
}

/** Mode 1: Startup Mode
 *  Mode 2: Basic Mode
 *  Mode 3: Normal Operation Mode
 */
async function sendPing(device, mode) {
    var modeid;

    switch (mode) {
        case 1:
            modeid = [0x00, 0x01, 0x00, 0x01, 0x00, 0x00]
            break;
        case 2:
            modeid = [0x00, 0x02, 0x00, 0x01, 0x00, 0x00]
            break;
        case 3:
            modeid = [0x00, 0x03, 0x00, 0x01, 0x00, 0x00]
            break;
    }


    await sendVirtualFinal(device, modeid.concat([0x00, 0x00, 0x07, 0xD0]), 1);
    
}

async function requestBufferSize(device) {

    // create a TypedArray with a size in bytes
    var data = new Uint8Array([0x00, 0x00, 0x00, 0x04, 0x01, 0x00, 0x00, 0x04, 0x00]);

    console.log("Bulk out: " + data);

    device.transferOut(ENDPOINTOUT, data);

    // Ready to receive data
    let result = await device.transferIn(ENDPOINTIN, 9)
    // console.log("Result");
    // console.log(result);
    var arrayBuffer = result.data.buffer;
    var uint8View = new Uint8Array(arrayBuffer);
    console.log(uint8View);
    
    var bufSizeAlloc = uint8View[5] << 24;
    bufSizeAlloc |= uint8View[6] << 16;
    bufSizeAlloc |= uint8View[7] << 8;
    bufSizeAlloc |= uint8View[8];
    // console.log(bufSizeAlloc);
    return bufSizeAlloc;

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

        MAXPACKETLEN = await requestBufferSize(device);
        console.log(MAXPACKETLEN);

        await sendPing(device, 3);

    } catch (error) {
        document.getElementById('target').innerHTML = error;
    }
}
