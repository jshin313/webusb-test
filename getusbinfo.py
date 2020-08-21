import usb.core
import usb.util
import sys
 
INTERFACE = 0
SETTING = 0

# set the active configuration. With no arguments, the first
# configuration will be the active one
# find our device
device = usb.core.find(idVendor=0x0451, idProduct=0xe008)

# was it found?
if device is None:
    raise ValueError('Device not found')

# By default, the kernel will claim the device and make it available via
# /dev/usb/hiddevN and /dev/hidrawN which also prevents us
# from communicating otherwise. This removes these kernel devices.
# Yes, it is weird to specify an interface before we get to a configuration.
if device.is_kernel_driver_active(INTERFACE):
    print("Detaching kernel driver")
    device.detach_kernel_driver(INTERFACE)

# print(device)

# set the active configuration. With no arguments, the first
# configuration will be the active one

device.set_configuration(1)

configuration = device.get_active_configuration()

# print(configuration)

interface = configuration[(INTERFACE, SETTING)]
bulkOut = interface[1]
bulkIn = interface[0]

# Lets start by Reading 1 byte from the Device using different Requests
# bRequest is a byte so there are 255 different values
# ret = device.ctrl_transfer(0xC0, 246, 0, 0, 1)
# print(ret)
data = [0x00, 0x00, 0x00, 0x04, 0x01, 0x00, 0x00, 0x04, 0x00]

# device.write(0x2, data, 100)
bulkOut.write(data)

# print(device.read(0x81, 9, 100))
print(bulkIn.read(9))
