[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=flat-square)](https://github.com/hacs/integration)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/VeniVidiVici/givtcp-power-flow-card?style=flat-square)

[![Github All Releases](https://img.shields.io/github/downloads/VeniVidiVici/givtcp-power-flow-card/total.svg)]()
![Build](https://github.com/VeniVidiVici/givtcp-power-flow-card/actions/workflows/build.yml/badge.svg)

# givtcp-power-flow-card

[home-assistant](home-assistant.io) power flow card for [GivTCP](https://github.com/britkat1980/giv_tcp) users.

![ezgif-2-552eb37751](https://user-images.githubusercontent.com/19427540/233187034-a4adfd2c-6c0d-443f-87fa-87543ed940e2.gif)

# Requirements

You need to have [GivTCP](https://github.com/britkat1980/giv_tcp) intergrated into your [home-assistant](home-assistant.io) (either as an addon or a standalone docker container).
You must have both the HA_AUTO_D (Home Assistant Auto Discovery) and MQTT_OUTPUT options enabled.

# HACS-Installation

1. [install HACS](https://hacs.xyz/docs/installation/installation) you need to install this first.
2. inside home-assistant go to HACS -> Frontend then click the 3 dots in the upper right hand corner.
3. select Custom repositories from the menu and enter https://github.com/VeniVidiVici/givtcp-power-flow-card in the Repository box and select Lovelace for the Category.
4. install the givtcp-power-flow-card using the UI

## UI configration options

![Screenshot 2023-04-19 at 20 45 51](https://user-images.githubusercontent.com/19427540/233187002-a550e64a-ac83-473a-8b58-870db139e587.png)

## Multiple Invertors and Batteries

Currently multiple invertors and batteries support is limited, total power is calculated by adding all the invertors together and the same for the batteries. State of Charge is calculated by averaging all the batteries together.
Clicking on an entity will show the details for the first battery or invertor in the list, this is a limitation of the way [home-assistant](home-assistant.io) handles these popups.

Future versions will allow you to list invertors and batteries separately on the card.

## Multiple layouts to choose form

### List

![Screenshot 2023-04-19 at 20 47 23](https://user-images.githubusercontent.com/19427540/233186987-c6318188-c4f6-4e7a-a274-88fe36616425.png)

### Circle

![Screenshot 2023-04-19 at 20 46 36](https://user-images.githubusercontent.com/19427540/233186990-b94f2711-ea60-459e-9f17-d70940efe454.png)

### Cross

![Screenshot 2023-04-19 at 20 46 30](https://user-images.githubusercontent.com/19427540/233186993-afbd77cf-ef54-477a-8eb3-06061ffc7067.png)

### Square

![Screenshot 2023-04-19 at 20 46 18](https://user-images.githubusercontent.com/19427540/233187000-979c64ad-89ae-4d10-821d-76ff9e3e5dd5.png)
