import usb.core
import usb.util
import sys
 
# set the active configuration. With no arguments, the first
# configuration will be the active one
# find our device
dev = usb.core.find(idVendor=0x0451, idProduct=0xe008)

# was it found?
if dev is None:
    raise ValueError('Device not found')
     
# print(dev)
configuration = dev.get_active_configuration()
print(configuration)

