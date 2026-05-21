import {
  BATTERY_COLOUR_RGB_DEFAULT,
  BATTERY_COLOUR_UI_DEFAULT,
  BATTERY_DOT_EASING_DEFAULT,
  BATTERY_ENABLED_DEFAULT,
  BATTERY_ICON_DEFAULT,
  CENTRE_ENTITY_DEFAULT,
  CIRCLE_SIZE_DEFAULT,
  COLOUR_ICONS_AND_TEXT_DEFAULT,
  COLOUR_TYPE_DEFAULT,
  CORNER_RADIUS_DEFAULT,
  CUSTOM1_COLOUR_RGB_DEFAULT,
  CUSTOM1_COLOUR_UI_DEFAULT,
  CUSTOM1_DOT_EASING_DEFAULT,
  CUSTOM1_ENABLED_DEFAULT,
  CUSTOM1_ICON_DEFAULT,
  CUSTOM2_COLOUR_RGB_DEFAULT,
  CUSTOM2_COLOUR_UI_DEFAULT,
  CUSTOM2_DOT_EASING_DEFAULT,
  CUSTOM2_ENABLED_DEFAULT,
  CUSTOM2_ICON_DEFAULT,
  DETAILS_ENABLED_DEFAULT,
  DOT_SIZE_DEFAULT,
  DOT_SPEED_DEFAULT,
  ENTITIES,
  ENTITY_LAYOUT_DEFAULT,
  ENTITY_SIZE_DEFAULT,
  EPS_COLOUR_RGB_DEFAULT,
  EPS_COLOUR_UI_DEFAULT,
  EPS_DOT_EASING_DEFAULT,
  EPS_ENABLED_DEFAULT,
  EPS_ICON_DEFAULT,
  GRID_COLOUR_RGB_DEFAULT,
  GRID_COLOUR_UI_DEFAULT,
  GRID_DOT_EASING_DEFAULT,
  GRID_ICON_DEFAULT,
  HIDE_INACTIVE_FLOWS_DEFAULT,
  HOUSE_COLOUR_RGB_DEFAULT,
  HOUSE_COLOUR_UI_DEFAULT,
  HOUSE_DOT_EASING_DEFAULT,
  HOUSE_ICON_DEFAULT,
  LINE_GAP_DEFAULT,
  LINE_STYLE_DEFAULT,
  LINE_WIDTH_DEFAULT,
  NUM_DETAIL_COLUMNS_DEFAULT,
  PERCENTAGE,
  POWER_MARGIN_DEFAULT,
  SINGLE_BATTERY_DEFAULT,
  SINGLE_INVERTOR_DEFAULT,
  SOLAR_COLOUR_RGB_DEFAULT,
  SOLAR_COLOUR_UI_DEFAULT,
  SOLAR_DOT_EASING_DEFAULT,
  SOLAR_ENABLED_DEFAULT,
  SOLAR_ICON_DEFAULT,
} from './const';
import { DotEasing, EntityLayout, LineStyle, CentreEntity } from './types';

describe('const.ts', () => {
  describe('Battery constants', () => {
    it('BATTERY_COLOUR_RGB_DEFAULT should be correct', () => {
      expect(BATTERY_COLOUR_RGB_DEFAULT).toEqual([14, 139, 125]);
    });

    it('BATTERY_COLOUR_UI_DEFAULT should be correct', () => {
      expect(BATTERY_COLOUR_UI_DEFAULT).toBe('teal');
    });

    it('BATTERY_DOT_EASING_DEFAULT should be Linear', () => {
      expect(BATTERY_DOT_EASING_DEFAULT).toBe(DotEasing.Linear);
    });

    it('BATTERY_ENABLED_DEFAULT should be true', () => {
      expect(BATTERY_ENABLED_DEFAULT).toBe(true);
    });

    it('BATTERY_ICON_DEFAULT should be correct', () => {
      expect(BATTERY_ICON_DEFAULT).toBe('mdi:battery');
    });
  });

  describe('Custom1 constants', () => {
    it('CUSTOM1_COLOUR_RGB_DEFAULT should be correct', () => {
      expect(CUSTOM1_COLOUR_RGB_DEFAULT).toEqual([14, 139, 125]);
    });

    it('CUSTOM1_COLOUR_UI_DEFAULT should be correct', () => {
      expect(CUSTOM1_COLOUR_UI_DEFAULT).toBe('teal');
    });

    it('CUSTOM1_DOT_EASING_DEFAULT should be Linear', () => {
      expect(CUSTOM1_DOT_EASING_DEFAULT).toBe(DotEasing.Linear);
    });

    it('CUSTOM1_ENABLED_DEFAULT should be false', () => {
      expect(CUSTOM1_ENABLED_DEFAULT).toBe(false);
    });

    it('CUSTOM1_ICON_DEFAULT should be correct', () => {
      expect(CUSTOM1_ICON_DEFAULT).toBe('mdi:car');
    });
  });

  describe('Custom2 constants', () => {
    it('CUSTOM2_COLOUR_RGB_DEFAULT should be correct', () => {
      expect(CUSTOM2_COLOUR_RGB_DEFAULT).toEqual([14, 139, 125]);
    });

    it('CUSTOM2_COLOUR_UI_DEFAULT should be correct', () => {
      expect(CUSTOM2_COLOUR_UI_DEFAULT).toBe('teal');
    });

    it('CUSTOM2_DOT_EASING_DEFAULT should be Linear', () => {
      expect(CUSTOM2_DOT_EASING_DEFAULT).toBe(DotEasing.Linear);
    });

    it('CUSTOM2_ENABLED_DEFAULT should be false', () => {
      expect(CUSTOM2_ENABLED_DEFAULT).toBe(false);
    });

    it('CUSTOM2_ICON_DEFAULT should be correct', () => {
      expect(CUSTOM2_ICON_DEFAULT).toBe('mdi:heat-wave');
    });
  });

  describe('EPS constants', () => {
    it('EPS_COLOUR_RGB_DEFAULT should be correct', () => {
      expect(EPS_COLOUR_RGB_DEFAULT).toEqual([14, 139, 125]);
    });

    it('EPS_COLOUR_UI_DEFAULT should be correct', () => {
      expect(EPS_COLOUR_UI_DEFAULT).toBe('teal');
    });

    it('EPS_DOT_EASING_DEFAULT should be Linear', () => {
      expect(EPS_DOT_EASING_DEFAULT).toBe(DotEasing.Linear);
    });

    it('EPS_ENABLED_DEFAULT should be false', () => {
      expect(EPS_ENABLED_DEFAULT).toBe(false);
    });

    it('EPS_ICON_DEFAULT should be correct', () => {
      expect(EPS_ICON_DEFAULT).toBe('mdi:power-plug');
    });
  });

  describe('Grid constants', () => {
    it('GRID_COLOUR_RGB_DEFAULT should be correct', () => {
      expect(GRID_COLOUR_RGB_DEFAULT).toEqual([134, 96, 188]);
    });

    it('GRID_COLOUR_UI_DEFAULT should be correct', () => {
      expect(GRID_COLOUR_UI_DEFAULT).toBe('purple');
    });

    it('GRID_DOT_EASING_DEFAULT should be Linear', () => {
      expect(GRID_DOT_EASING_DEFAULT).toBe(DotEasing.Linear);
    });

    it('GRID_ICON_DEFAULT should be correct', () => {
      expect(GRID_ICON_DEFAULT).toBe('mdi:transmission-tower');
    });
  });

  describe('House constants', () => {
    it('HOUSE_COLOUR_RGB_DEFAULT should be correct', () => {
      expect(HOUSE_COLOUR_RGB_DEFAULT).toEqual([32, 139, 236]);
    });

    it('HOUSE_COLOUR_UI_DEFAULT should be correct', () => {
      expect(HOUSE_COLOUR_UI_DEFAULT).toBe('blue');
    });

    it('HOUSE_DOT_EASING_DEFAULT should be Linear', () => {
      expect(HOUSE_DOT_EASING_DEFAULT).toBe(DotEasing.Linear);
    });

    it('HOUSE_ICON_DEFAULT should be correct', () => {
      expect(HOUSE_ICON_DEFAULT).toBe('mdi:home');
    });
  });

  describe('Solar constants', () => {
    it('SOLAR_COLOUR_RGB_DEFAULT should be correct', () => {
      expect(SOLAR_COLOUR_RGB_DEFAULT).toEqual([255, 185, 47]);
    });

    it('SOLAR_COLOUR_UI_DEFAULT should be correct', () => {
      expect(SOLAR_COLOUR_UI_DEFAULT).toBe('amber');
    });

    it('SOLAR_DOT_EASING_DEFAULT should be Linear', () => {
      expect(SOLAR_DOT_EASING_DEFAULT).toBe(DotEasing.Linear);
    });

    it('SOLAR_ENABLED_DEFAULT should be true', () => {
      expect(SOLAR_ENABLED_DEFAULT).toBe(true);
    });

    it('SOLAR_ICON_DEFAULT should be correct', () => {
      expect(SOLAR_ICON_DEFAULT).toBe('mdi:solar-panel-large');
    });
  });

  describe('Other constants', () => {
    it('CENTRE_ENTITY_DEFAULT should be None', () => {
      expect(CENTRE_ENTITY_DEFAULT).toBe(CentreEntity.None);
    });

    it('CIRCLE_SIZE_DEFAULT should be correct', () => {
      expect(CIRCLE_SIZE_DEFAULT).toBe(40);
    });

    it('COLOUR_ICONS_AND_TEXT_DEFAULT should be true', () => {
      expect(COLOUR_ICONS_AND_TEXT_DEFAULT).toBe(true);
    });

    it('COLOUR_TYPE_DEFAULT should be correct', () => {
      expect(COLOUR_TYPE_DEFAULT).toBe('ui');
    });

    it('CORNER_RADIUS_DEFAULT should be correct', () => {
      expect(CORNER_RADIUS_DEFAULT).toBe(2);
    });

    it('DETAILS_ENABLED_DEFAULT should be false', () => {
      expect(DETAILS_ENABLED_DEFAULT).toBe(false);
    });

    it('DOT_SIZE_DEFAULT should be correct', () => {
      expect(DOT_SIZE_DEFAULT).toBe(4);
    });

    it('DOT_SPEED_DEFAULT should be correct', () => {
      expect(DOT_SPEED_DEFAULT).toBe(4);
    });

    it('ENTITIES should contain correct entities', () => {
      expect(ENTITIES).toEqual(['solar', 'house', 'grid', 'battery', 'eps', 'custom1', 'custom2']);
    });

    it('ENTITY_LAYOUT_DEFAULT should be Cross', () => {
      expect(ENTITY_LAYOUT_DEFAULT).toBe(EntityLayout.Cross);
    });

    it('ENTITY_SIZE_DEFAULT should be correct', () => {
      expect(ENTITY_SIZE_DEFAULT).toBe(4);
    });

    it('HIDE_INACTIVE_FLOWS_DEFAULT should be false', () => {
      expect(HIDE_INACTIVE_FLOWS_DEFAULT).toBe(false);
    });

    it('LINE_GAP_DEFAULT should be correct', () => {
      expect(LINE_GAP_DEFAULT).toBe(2);
    });

    it('LINE_STYLE_DEFAULT should be Curved', () => {
      expect(LINE_STYLE_DEFAULT).toBe(LineStyle.Curved);
    });

    it('LINE_WIDTH_DEFAULT should be correct', () => {
      expect(LINE_WIDTH_DEFAULT).toBe(2);
    });

    it('NUM_DETAIL_COLUMNS_DEFAULT should be correct', () => {
      expect(NUM_DETAIL_COLUMNS_DEFAULT).toBe(3);
    });

    it('PERCENTAGE should be %', () => {
      expect(PERCENTAGE).toBe('%');
    });

    it('POWER_MARGIN_DEFAULT should be correct', () => {
      expect(POWER_MARGIN_DEFAULT).toBe(20);
    });

    it('SINGLE_BATTERY_DEFAULT should be true', () => {
      expect(SINGLE_BATTERY_DEFAULT).toBe(true);
    });

    it('SINGLE_INVERTOR_DEFAULT should be true', () => {
      expect(SINGLE_INVERTOR_DEFAULT).toBe(true);
    });
  });
});
