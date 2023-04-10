# givtcp-power-flow-card

> **⚠ WARNING: VERY MUCH IN ALPHA STAGE**
> While basic functionality is working this is still very much beta, there are settings in the config UI that are not yet implimented and some basic settings are still missing.

[home-assistant](home-assistant.io) power flow card for [GivTCP](https://github.com/britkat1980/giv_tcp) users.

![ezgif-1-513ef55daa](https://user-images.githubusercontent.com/19427540/230995889-6586adbf-5d4a-4b8e-8cf7-a3bef956aa36.gif)

![Screenshot 2023-04-10 at 21 45 55](https://user-images.githubusercontent.com/19427540/230996371-b509531c-a822-4254-be17-813704cfab6e.png)
![Screenshot 2023-04-10 at 21 45 27](https://user-images.githubusercontent.com/19427540/230996373-3348000f-44a8-4bd1-85ab-1e367ee23f81.png)
![Screenshot 2023-04-10 at 21 45 16](https://user-images.githubusercontent.com/19427540/230996375-f4be1a0a-8cbf-4785-a28e-45244939c776.png)
![Screenshot 2023-04-10 at 21 44 51](https://user-images.githubusercontent.com/19427540/230996376-02d36f4f-38fc-46bd-b907-faac59c94b56.png)

# Requirements

You need to have [GivTCP](https://github.com/britkat1980/giv_tcp) intergrated into your [home-assistant](home-assistant.io) (either as an addon or a standalone docker container).
You must have both the HA_AUTO_D (Home Assistant Auto Discovery) and MQTT_OUTPUT options enabled.

# HACS-Installation

1. [install HACS](https://hacs.xyz/docs/installation/installation) you need to install this first.
2. inisde home-assistant go to HACS -> Frontend then click the 3 dots in the upper right hand corner.
3. select Custom repositories from the menu and enter https://github.com/VeniVidiVici/givtcp-power-flow-card in the Repository box and select Lovelace for the Category.
4. install the givtcp-power-flow-card using the UI
