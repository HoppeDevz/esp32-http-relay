
struct portForward {
  int port;
  char* ipv4;
};

const int numberOfPortForwards = 1;
const portForward portForwardConfiguration[numberOfPortForwards] = {
   { 30120, "192.168.1.80" }
};

portForward getPortForward(int targetPort) {

  for (int i = 0; i < numberOfPortForwards; i++) {

    if (portForwardConfiguration[i].port == targetPort) return portForwardConfiguration[i];
  }

  return { -1, nullptr };
}
