import gpiozero
from gpiozero import Button
import time

led = gpiozero.LED(17)
button = Button(2)

while True:
    if button.is_pressed:
        led.on()
    else:
        led.off()
    time.sleep(0.1)
