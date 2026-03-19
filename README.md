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

## Supported data source

This card is designed for GivTCP entity naming and discovery. In practice that means the card expects GivTCP serial number sensors such as `sensor.*_invertor_serial_number` and `sensor.*_battery_serial_number`.

If you are using another inverter integration such as FoxESS, the card will not auto-configure unless that integration exposes equivalent GivTCP-style entities.

## Configuring entities

1. Open the card editor and go to `General`.
2. Pick your `Invertor/AIO` or `Invertors` from the discovered `sensor.*_invertor_serial_number` entities.
3. Pick your `Battery` or `Batteries` from the discovered `sensor.*_battery_serial_number` entities.
4. The card derives the rest of the flow sensors from those serial numbers.

If you want to represent extra loads or generation sources that are not part of GivTCP, use `Custom 1` and `Custom 2` in the `House` tab and point them at any power sensor.

## Troubleshooting entity selection

If the editor picker is empty or your inverter does not appear:

1. Confirm you have GivTCP entities in Home Assistant, especially `sensor.*_invertor_serial_number` and `sensor.*_battery_serial_number`.
2. In GivTCP, make sure `HA_AUTO_D` (Home Assistant auto discovery) and `MQTT_OUTPUT` are enabled.
3. Check Developer Tools -> States in Home Assistant and verify those serial-number sensors actually exist.
4. Reopen the card editor after the entities appear.

This card does not currently support arbitrary inverter integrations by manually mapping every flow sensor. Integrations such as FoxESS only work if they expose equivalent GivTCP-style serial-number entities.

# Local development

This repo now includes a reusable Home Assistant Docker setup so you can get back to card development quickly.

## One-time setup

1. Install dependencies with `npm install`.
2. Start Home Assistant with `npm run ha:start`.
3. In a second terminal, start the card watcher with `npm run dev:watch`.
4. Open `http://localhost:8123` and finish the normal Home Assistant onboarding.
5. The demo dashboard is already configured and loads the local build from `/local/givtcp-power-flow-card/givtcp-power-flow-card.js?v=dev`.

## Daily workflow

1. Run `npm run ha:start`.
2. Run `npm run dev:watch`.
3. Edit files in `src/`.
4. Refresh Home Assistant in the browser to pick up the rebuilt card bundle.

## Useful commands

- `npm run ha:start` - start the local Home Assistant container
- `npm run ha:stop` - stop the local Home Assistant container
- `npm run ha:logs` - follow Home Assistant logs
- `npm run dev:watch` - rebuild the card on every file save
- `npm run build` - produce a release build in `dist/`

## Local Home Assistant contents

- `docker-compose.dev.yml` starts an isolated Home Assistant container on port `8123`
- `home-assistant/config/configuration.yaml` registers the card as a Lovelace resource and seeds demo entities
- `home-assistant/config/ui-lovelace.yaml` provides a ready-made dashboard for the card
- `dist/` is bind-mounted into Home Assistant's `www` folder so each rebuild is immediately available after a browser refresh

## Using real GivTCP data later

When you want to test against your live setup instead of the seeded demo sensors, point the card at your real `sensor.*_invertor_serial_number` entity and related GivTCP sensors, or copy the same resource path into your normal Home Assistant instance.

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

## Solar input sensors

You can optionally show individual solar input wattage on the solar node by setting `Solar Input 1 Sensors` and `Solar Input 2 Sensors` in the `Solar` tab. Each field accepts one or more power sensors, so you can sum matching PV input sensors across multiple inverters.

## Multiple layouts to choose form

### List

![Screenshot 2023-04-19 at 20 47 23](https://user-images.githubusercontent.com/19427540/233186987-c6318188-c4f6-4e7a-a274-88fe36616425.png)

### Circle

![Screenshot 2023-04-19 at 20 46 36](https://user-images.githubusercontent.com/19427540/233186990-b94f2711-ea60-459e-9f17-d70940efe454.png)

### Cross

![Screenshot 2023-04-19 at 20 46 30](https://user-images.githubusercontent.com/19427540/233186993-afbd77cf-ef54-477a-8eb3-06061ffc7067.png)

### Square

![Screenshot 2023-04-19 at 20 46 18](https://user-images.githubusercontent.com/19427540/233187000-979c64ad-89ae-4d10-821d-76ff9e3e5dd5.png)
