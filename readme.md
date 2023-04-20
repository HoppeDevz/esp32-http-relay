## ESP32 HTTP PORT FORWARD


## Installation

### *Server Side*
If you're having problems with CGNAT you can use this.
It's very simple.

First of all, put the "server" folder in your intermediate server.
Just add all ports of your local network on config/index.tsx -> HTTP_RELAYS

!!(REMEMBER TO ALLOW PORT 32512 ON THE FIREWALL)!!


### *Client Side*

Now replace the ip located at client/esp32.ino
```c++
const char* webSocketUrl = "0.0.0.0";
```

After that, you can configure which IP the destination port should go on client/port_forward.h

For example.

30120 -> 192.168.1.80

So, every request on your server at port 30120 should go to your local network to IP 192.168.1.80.