import { cardConfigStruct, INVERTER_BATTERY_SCHEMA, ENTITY_SCHEMA, GRID_SCHEMA, HOUSE_SCHEMA, BATTERY_SCHEMA, SOLAR_SCHEMA, EXTRAS_SCHEMA, LAYOUT_SCHEMA, LAYOUT_TYPE_SCHEMA, DETAILS_SCHEMA } from './schemas';
import { DotEasing, EntityLayout, LineStyle, CentreEntity } from './types';
import { LovelaceCardConfig } from 'custom-card-helpers';

describe('schemas.ts', () => {
  describe('cardConfigStruct', () => {
    it('should be defined', () => {
      expect(cardConfigStruct).toBeDefined();
    });

    it('should have type property as required', () => {
      expect(cardConfigStruct.schema.type).toBeDefined();
    });

    it('should have optional name property', () => {
      expect(cardConfigStruct.schema.name).toBeDefined();
    });

    it('should have optional demo_mode property', () => {
      expect(cardConfigStruct.schema.demo_mode).toBeDefined();
    });

    it('should have optional batteries property', () => {
      expect(cardConfigStruct.schema.batteries).toBeDefined();
    });

    it('should have optional battery_colour_type property', () => {
      expect(cardConfigStruct.schema.battery_colour_type).toBeDefined();
    });

    it('should have optional battery_colour property', () => {
      expect(cardConfigStruct.schema.battery_colour).toBeDefined();
    });

    it('should have optional battery_dot_easing property', () => {
      expect(cardConfigStruct.schema.battery_dot_easing).toBeDefined();
    });

    it('should have optional battery_enabled property', () => {
      expect(cardConfigStruct.schema.battery_enabled).toBeDefined();
    });

    it('should have optional battery_icon property', () => {
      expect(cardConfigStruct.schema.battery_icon).toBeDefined();
    });

    it('should have optional battery property', () => {
      expect(cardConfigStruct.schema.battery).toBeDefined();
    });

    it('should have optional centre_entity property', () => {
      expect(cardConfigStruct.schema.centre_entity).toBeDefined();
    });

    it('should have optional circle_size property', () => {
      expect(cardConfigStruct.schema.circle_size).toBeDefined();
    });

    it('should have optional colour_icons_and_text property', () => {
      expect(cardConfigStruct.schema.colour_icons_and_text).toBeDefined();
    });

    it('should have optional corner_radius property', () => {
      expect(cardConfigStruct.schema.corner_radius).toBeDefined();
    });

    it('should have optional custom1_colour_type property', () => {
      expect(cardConfigStruct.schema.custom1_colour_type).toBeDefined();
    });

    it('should have optional custom1_colour property', () => {
      expect(cardConfigStruct.schema.custom1_colour).toBeDefined();
    });

    it('should have optional custom1_dot_easing property', () => {
      expect(cardConfigStruct.schema.custom1_dot_easing).toBeDefined();
    });

    it('should have optional custom1_enabled property', () => {
      expect(cardConfigStruct.schema.custom1_enabled).toBeDefined();
    });

    it('should have optional custom1_extra_sensor property', () => {
      expect(cardConfigStruct.schema.custom1_extra_sensor).toBeDefined();
    });

    it('should have optional custom1_icon property', () => {
      expect(cardConfigStruct.schema.custom1_icon).toBeDefined();
    });

    it('should have optional custom1_name property', () => {
      expect(cardConfigStruct.schema.custom1_name).toBeDefined();
    });

    it('should have optional custom1_sensor property', () => {
      expect(cardConfigStruct.schema.custom1_sensor).toBeDefined();
    });

    it('should have optional custom2_colour_type property', () => {
      expect(cardConfigStruct.schema.custom2_colour_type).toBeDefined();
    });

    it('should have optional custom2_colour property', () => {
      expect(cardConfigStruct.schema.custom2_colour).toBeDefined();
    });

    it('should have optional custom2_dot_easing property', () => {
      expect(cardConfigStruct.schema.custom2_dot_easing).toBeDefined();
    });

    it('should have optional custom2_enabled property', () => {
      expect(cardConfigStruct.schema.custom2_enabled).toBeDefined();
    });

    it('should have optional custom2_extra_sensor property', () => {
      expect(cardConfigStruct.schema.custom2_extra_sensor).toBeDefined();
    });

    it('should have optional custom2_icon property', () => {
      expect(cardConfigStruct.schema.custom2_icon).toBeDefined();
    });

    it('should have optional custom2_name property', () => {
      expect(cardConfigStruct.schema.custom2_name).toBeDefined();
    });

    it('should have optional custom2_sensor property', () => {
      expect(cardConfigStruct.schema.custom2_sensor).toBeDefined();
    });

    it('should have optional detail_entities property', () => {
      expect(cardConfigStruct.schema.detail_entities).toBeDefined();
    });

    it('should have optional details_enabled property', () => {
      expect(cardConfigStruct.schema.details_enabled).toBeDefined();
    });

    it('should have optional dot_size property', () => {
      expect(cardConfigStruct.schema.dot_size).toBeDefined();
    });

    it('should have optional dot_speed property', () => {
      expect(cardConfigStruct.schema.dot_speed).toBeDefined();
    });

    it('should have optional entity_layout property', () => {
      expect(cardConfigStruct.schema.entity_layout).toBeDefined();
    });

    it('should have optional entity_line_width property', () => {
      expect(cardConfigStruct.schema.entity_line_width).toBeDefined();
    });

    it('should have optional entity_size property', () => {
      expect(cardConfigStruct.schema.entity_size).toBeDefined();
    });

    it('should have optional eps_colour_type property', () => {
      expect(cardConfigStruct.schema.eps_colour_type).toBeDefined();
    });

    it('should have optional eps_colour property', () => {
      expect(cardConfigStruct.schema.eps_colour).toBeDefined();
    });

    it('should have optional eps_dot_easing property', () => {
      expect(cardConfigStruct.schema.eps_dot_easing).toBeDefined();
    });

    it('should have optional eps_enabled property', () => {
      expect(cardConfigStruct.schema.eps_enabled).toBeDefined();
    });

    it('should have optional eps_icon property', () => {
      expect(cardConfigStruct.schema.eps_icon).toBeDefined();
    });

    it('should have optional grid_colour_type property', () => {
      expect(cardConfigStruct.schema.grid_colour_type).toBeDefined();
    });

    it('should have optional grid_colour property', () => {
      expect(cardConfigStruct.schema.grid_colour).toBeDefined();
    });

    it('should have optional grid_dot_easing property', () => {
      expect(cardConfigStruct.schema.grid_dot_easing).toBeDefined();
    });

    it('should have optional grid_icon property', () => {
      expect(cardConfigStruct.schema.grid_icon).toBeDefined();
    });

    it('should have optional hide_inactive_flows property', () => {
      expect(cardConfigStruct.schema.hide_inactive_flows).toBeDefined();
    });

    it('should have optional house_colour_type property', () => {
      expect(cardConfigStruct.schema.house_colour_type).toBeDefined();
    });

    it('should have optional house_colour property', () => {
      expect(cardConfigStruct.schema.house_colour).toBeDefined();
    });

    it('should have optional house_dot_easing property', () => {
      expect(cardConfigStruct.schema.house_dot_easing).toBeDefined();
    });

    it('should have optional house_icon property', () => {
      expect(cardConfigStruct.schema.house_icon).toBeDefined();
    });

    it('should have optional invertor property', () => {
      expect(cardConfigStruct.schema.invertor).toBeDefined();
    });

    it('should have optional invertors property', () => {
      expect(cardConfigStruct.schema.invertors).toBeDefined();
    });

    it('should have optional line_gap property', () => {
      expect(cardConfigStruct.schema.line_gap).toBeDefined();
    });

    it('should have optional line_style property', () => {
      expect(cardConfigStruct.schema.line_style).toBeDefined();
    });

    it('should have optional line_width property', () => {
      expect(cardConfigStruct.schema.line_width).toBeDefined();
    });

    it('should have optional num_detail_columns property', () => {
      expect(cardConfigStruct.schema.num_detail_columns).toBeDefined();
    });

    it('should have optional power_margin property', () => {
      expect(cardConfigStruct.schema.power_margin).toBeDefined();
    });

    it('should have optional single_battery property', () => {
      expect(cardConfigStruct.schema.single_battery).toBeDefined();
    });

    it('should have optional single_invertor property', () => {
      expect(cardConfigStruct.schema.single_invertor).toBeDefined();
    });

    it('should have optional solar_colour_type property', () => {
      expect(cardConfigStruct.schema.solar_colour_type).toBeDefined();
    });

    it('should have optional solar_colour property', () => {
      expect(cardConfigStruct.schema.solar_colour).toBeDefined();
    });

    it('should have optional solar_dot_easing property', () => {
      expect(cardConfigStruct.schema.solar_dot_easing).toBeDefined();
    });

    it('should have optional solar_enabled property', () => {
      expect(cardConfigStruct.schema.solar_enabled).toBeDefined();
    });

    it('should have optional solar_icon property', () => {
      expect(cardConfigStruct.schema.solar_icon).toBeDefined();
    });
  });

  describe('INVERTER_BATTERY_SCHEMA', () => {
    it('should return schema with single invertor and single battery by default', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;
      const invertors = ['givtcp_inverter_1', 'givtcp_inverter_2'];
      const batteries = ['givtcp_battery_1', 'givtcp_battery_2'];

      const result = INVERTER_BATTERY_SCHEMA(config, invertors, batteries);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('grid');
      expect(result[0].schema).toHaveLength(2);
    });

    it('should filter invertors when single_invertor is false', () => {
      const config = { type: 'custom:givtcp-power-flow-card', single_invertor: false, invertors: ['givtcp_inverter_1'] } as LovelaceCardConfig;
      const invertors = ['givtcp_inverter_1', 'givtcp_inverter_2'];
      const batteries = ['givtcp_battery_1'];

      const result = INVERTER_BATTERY_SCHEMA(config, invertors, batteries);

      expect(result).toBeDefined();
    });

    it('should filter batteries when single_battery is false', () => {
      const config = { type: 'custom:givtcp-power-flow-card', single_battery: false, batteries: ['givtcp_battery_1'] } as LovelaceCardConfig;
      const invertors = ['givtcp_inverter_1'];
      const batteries = ['givtcp_battery_1', 'givtcp_battery_2'];

      const result = INVERTER_BATTERY_SCHEMA(config, invertors, batteries);

      expect(result).toBeDefined();
    });

    it('should use single_invertor from config when provided', () => {
      const config = { type: 'custom:givtcp-power-flow-card', single_invertor: true } as LovelaceCardConfig;
      const invertors = ['givtcp_inverter_1'];
      const batteries = ['givtcp_battery_1'];

      const result = INVERTER_BATTERY_SCHEMA(config, invertors, batteries);

      expect(result).toBeDefined();
    });

    it('should use single_battery from config when provided', () => {
      const config = { type: 'custom:givtcp-power-flow-card', single_battery: true } as LovelaceCardConfig;
      const invertors = ['givtcp_inverter_1'];
      const batteries = ['givtcp_battery_1'];

      const result = INVERTER_BATTERY_SCHEMA(config, invertors, batteries);

      expect(result).toBeDefined();
    });
  });

  describe('ENTITY_SCHEMA', () => {
    it('should return schema with icon, dot easing, colour type and colour', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;

      const result = ENTITY_SCHEMA(config, 'grid', 'Grid', 'mdi:transmission-tower');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('grid');
      expect(result[0].schema).toHaveLength(4);
    });

    it('should include grid_icon in schema', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;

      const result = ENTITY_SCHEMA(config, 'grid', 'Grid', 'mdi:transmission-tower');

      const iconField = result[0].schema.find((field: any) => field.name === 'grid_icon');
      expect(iconField).toBeDefined();
    });

    it('should include grid_dot_easing in schema', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;

      const result = ENTITY_SCHEMA(config, 'grid', 'Grid', 'mdi:transmission-tower');

      const easingField = result[0].schema.find((field: any) => field.name === 'grid_dot_easing');
      expect(easingField).toBeDefined();
    });

    it('should include grid_colour_type in schema', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;

      const result = ENTITY_SCHEMA(config, 'grid', 'Grid', 'mdi:transmission-tower');

      const colourTypeField = result[0].schema.find((field: any) => field.name === 'grid_colour_type');
      expect(colourTypeField).toBeDefined();
    });

    it('should include grid_colour in schema', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;

      const result = ENTITY_SCHEMA(config, 'grid', 'Grid', 'mdi:transmission-tower');

      const colourField = result[0].schema.find((field: any) => field.name === 'grid_colour');
      expect(colourField).toBeDefined();
    });
  });

  describe('GRID_SCHEMA', () => {
    it('should return grid entity schema', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;

      const result = GRID_SCHEMA(config);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('HOUSE_SCHEMA', () => {
    it('should return house entity schema', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;

      const result = HOUSE_SCHEMA(config);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('BATTERY_SCHEMA', () => {
    it('should return schema with battery_enabled by default', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;

      const result = BATTERY_SCHEMA(config);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('battery_enabled');
    });

    it('should include battery entity schema when battery_enabled is true', () => {
      const config = { type: 'custom:givtcp-power-flow-card', battery_enabled: true } as LovelaceCardConfig;

      const result = BATTERY_SCHEMA(config);

      expect(result.length).toBeGreaterThan(1);
      // ENTITY_SCHEMA returns a grid with nested schema
      const batteryGrid = result.find((field: any) => field.type === 'grid' && field.schema);
      expect(batteryGrid).toBeDefined();
      const batteryIconField = batteryGrid?.schema?.find((field: any) => field.name === 'battery_icon');
      expect(batteryIconField).toBeDefined();
    });

    it('should include eps_enabled when battery_enabled is true', () => {
      const config = { type: 'custom:givtcp-power-flow-card', battery_enabled: true } as LovelaceCardConfig;

      const result = BATTERY_SCHEMA(config);

      const epsEnabledField = result.find((field: any) => field.name === 'eps_enabled');
      expect(epsEnabledField).toBeDefined();
    });

    it('should include eps entity schema when eps_enabled is true', () => {
      const config = { type: 'custom:givtcp-power-flow-card', battery_enabled: true, eps_enabled: true } as LovelaceCardConfig;

      const result = BATTERY_SCHEMA(config);

      // EPS schema is added as a grid with nested schema
      const epsGrid = result.find((field: any) => field.type === 'grid' && field.schema?.some((s: any) => s.name === 'eps_icon'));
      expect(epsGrid).toBeDefined();
    });
  });

  describe('SOLAR_SCHEMA', () => {
    it('should return schema with solar_enabled by default', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;

      const result = SOLAR_SCHEMA(config);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('solar_enabled');
    });

    it('should include solar entity schema when solar_enabled is true', () => {
      const config = { type: 'custom:givtcp-power-flow-card', solar_enabled: true } as LovelaceCardConfig;

      const result = SOLAR_SCHEMA(config);

      expect(result.length).toBeGreaterThan(1);
      // ENTITY_SCHEMA returns a grid with nested schema
      const solarGrid = result.find((field: any) => field.type === 'grid' && field.schema);
      expect(solarGrid).toBeDefined();
      const solarIconField = solarGrid?.schema?.find((field: any) => field.name === 'solar_icon');
      expect(solarIconField).toBeDefined();
    });
  });

  describe('EXTRAS_SCHEMA', () => {
    it('should return schema with custom1_enabled by default', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;

      const result = EXTRAS_SCHEMA(config);

      expect(result[0].name).toBe('custom1_enabled');
    });

    it('should include custom1 fields when custom1_enabled is true', () => {
      const config = { type: 'custom:givtcp-power-flow-card', custom1_enabled: true } as LovelaceCardConfig;

      const result = EXTRAS_SCHEMA(config);

      const custom1NameField = result.find((field: any) => field.name === 'custom1_name');
      expect(custom1NameField).toBeDefined();
      // custom1_sensor is in a nested grid
      const custom1Grid = result.find((field: any) => field.type === 'grid' && field.schema?.some((s: any) => s.name === 'custom1_sensor'));
      expect(custom1Grid).toBeDefined();
      // custom1_icon is in ENTITY_SCHEMA grid
      const custom1IconGrid = result.find((field: any) => field.type === 'grid' && field.schema?.some((s: any) => s.name === 'custom1_icon'));
      expect(custom1IconGrid).toBeDefined();
    });

    it('should include custom2_enabled in schema', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;

      const result = EXTRAS_SCHEMA(config);

      const custom2EnabledField = result.find((field: any) => field.name === 'custom2_enabled');
      expect(custom2EnabledField).toBeDefined();
    });

    it('should include custom2 fields when custom2_enabled is true', () => {
      const config = { type: 'custom:givtcp-power-flow-card', custom1_enabled: false, custom2_enabled: true } as LovelaceCardConfig;

      const result = EXTRAS_SCHEMA(config);

      const custom2NameField = result.find((field: any) => field.name === 'custom2_name');
      expect(custom2NameField).toBeDefined();
      // custom2_sensor is in a nested grid
      const custom2Grid = result.find((field: any) => field.type === 'grid' && field.schema?.some((s: any) => s.name === 'custom2_sensor'));
      expect(custom2Grid).toBeDefined();
      // custom2_icon is in ENTITY_SCHEMA grid
      const custom2IconGrid = result.find((field: any) => field.type === 'grid' && field.schema?.some((s: any) => s.name === 'custom2_icon'));
      expect(custom2IconGrid).toBeDefined();
    });

    it('should include custom1_extra_sensor when custom1_enabled is true', () => {
      const config = { type: 'custom:givtcp-power-flow-card', custom1_enabled: true } as LovelaceCardConfig;

      const result = EXTRAS_SCHEMA(config);

      // custom1_extra_sensor is in a nested grid
      const custom1Grid = result.find((field: any) => field.type === 'grid' && field.schema?.some((s: any) => s.name === 'custom1_extra_sensor'));
      expect(custom1Grid).toBeDefined();
    });

    it('should include custom2_extra_sensor when custom2_enabled is true', () => {
      const config = { type: 'custom:givtcp-power-flow-card', custom1_enabled: false, custom2_enabled: true } as LovelaceCardConfig;

      const result = EXTRAS_SCHEMA(config);

      // custom2_extra_sensor is in a nested grid
      const custom2Grid = result.find((field: any) => field.type === 'grid' && field.schema?.some((s: any) => s.name === 'custom2_extra_sensor'));
      expect(custom2Grid).toBeDefined();
    });
  });

  describe('LAYOUT_SCHEMA', () => {
    it('should have entity_layout with default value', () => {
      expect(LAYOUT_SCHEMA).toHaveLength(1);
      expect(LAYOUT_SCHEMA[0].name).toBe('entity_layout');
      expect(LAYOUT_SCHEMA[0].default).toBe(EntityLayout.Cross);
    });

    it('should have selector with options for Cross, Circle, Square, and List', () => {
      const selector = LAYOUT_SCHEMA[0].selector;
      expect(selector.select.options).toHaveLength(4);
      const values = selector.select.options.map((opt: any) => opt.value);
      expect(values).toContain(EntityLayout.Cross);
      expect(values).toContain(EntityLayout.Circle);
      expect(values).toContain(EntityLayout.Square);
      expect(values).toContain(EntityLayout.List);
    });
  });

  describe('LAYOUT_TYPE_SCHEMA', () => {
    it('should return corner_radius and line_gap for cross layout', () => {
      const config = { type: 'custom:givtcp-power-flow-card', entity_layout: 'cross' } as LovelaceCardConfig;

      const result = LAYOUT_TYPE_SCHEMA(config);

      expect(result.length).toBeGreaterThan(0);
      const cornerRadiusField = result.find((field: any) => field.name === 'corner_radius');
      expect(cornerRadiusField).toBeDefined();
    });

    it('should return line_style for square layout', () => {
      const config = { type: 'custom:givtcp-power-flow-card', entity_layout: 'square' } as LovelaceCardConfig;

      const result = LAYOUT_TYPE_SCHEMA(config);

      expect(result.length).toBeGreaterThan(0);
      const lineStyleField = result.find((field: any) => field.name === 'line_style');
      expect(lineStyleField).toBeDefined();
    });

    it('should return line_gap for square layout with curved line_style', () => {
      const config = { type: 'custom:givtcp-power-flow-card', entity_layout: 'square', line_style: 'curved' } as LovelaceCardConfig;

      const result = LAYOUT_TYPE_SCHEMA(config);

      const lineGapField = result.find((field: any) => field.name === 'line_gap');
      expect(lineGapField).toBeDefined();
    });

    it('should return circle_size and centre_entity for circle layout', () => {
      const config = { type: 'custom:givtcp-power-flow-card', entity_layout: 'circle' } as LovelaceCardConfig;

      const result = LAYOUT_TYPE_SCHEMA(config);

      expect(result.length).toBeGreaterThan(0);
      const circleSizeField = result.find((field: any) => field.name === 'circle_size');
      expect(circleSizeField).toBeDefined();
      const centreEntityField = result.find((field: any) => field.name === 'centre_entity');
      expect(centreEntityField).toBeDefined();
    });

    it('should return empty array for unknown layout', () => {
      const config = { type: 'custom:givtcp-power-flow-card', entity_layout: 'unknown' } as LovelaceCardConfig;

      const result = LAYOUT_TYPE_SCHEMA(config);

      expect(result).toHaveLength(0);
    });

    it('should return empty array for list layout', () => {
      const config = { type: 'custom:givtcp-power-flow-card', entity_layout: 'list' } as LovelaceCardConfig;

      const result = LAYOUT_TYPE_SCHEMA(config);

      expect(result).toHaveLength(0);
    });
  });

  describe('DETAILS_SCHEMA', () => {
    it('should return schema with details_enabled by default', () => {
      const config = { type: 'custom:givtcp-power-flow-card' } as LovelaceCardConfig;
      const entities = ['sensor.power1', 'sensor.power2'];

      const result = DETAILS_SCHEMA(config, entities);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('details_enabled');
    });

    it('should include num_detail_columns when details_enabled is true', () => {
      const config = { type: 'custom:givtcp-power-flow-card', details_enabled: true } as LovelaceCardConfig;
      const entities = ['sensor.power1', 'sensor.power2'];

      const result = DETAILS_SCHEMA(config, entities);

      const numColumnsField = result.find((field: any) => field.name === 'num_detail_columns');
      expect(numColumnsField).toBeDefined();
    });

    it('should include detail_entities selector when details_enabled is true', () => {
      const config = { type: 'custom:givtcp-power-flow-card', details_enabled: true } as LovelaceCardConfig;
      const entities = ['sensor.power1', 'sensor.power2'];

      const result = DETAILS_SCHEMA(config, entities);

      const entitiesField = result.find((field: any) => field.name === 'detail_entities');
      expect(entitiesField).toBeDefined();
    });

    it('should filter out entities already in detail_entities', () => {
      const config = { type: 'custom:givtcp-power-flow-card', details_enabled: true, detail_entities: ['sensor.power1'] } as LovelaceCardConfig;
      const entities = ['sensor.power1', 'sensor.power2'];

      const result = DETAILS_SCHEMA(config, entities);

      const entitiesField = result.find((field: any) => field.name === 'detail_entities');
      expect(entitiesField).toBeDefined();
    });
  });
});
