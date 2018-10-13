#include <iostream>
#include <chrono>
#include <thread>

int main(int argc, char *argv[])
{
  if (argc > 1) {
    std::this_thread::sleep_for(std::chrono::seconds(atoi(argv[1])));
  }
  std::cout << "Success!" << std::endl;
  return 0;
}
