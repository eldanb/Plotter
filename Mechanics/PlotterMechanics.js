const { extrudeLinear } = require('@jscad/modeling').extrusions;
const { geom2 } = require('@jscad/modeling').geometries;
const { cylinder, cuboid } = require('@jscad/modeling').primitives;
const { union, subtract } = require('@jscad/modeling').booleans;
const { translate, rotate } = require('@jscad/modeling').transforms;


const spacing_epsilon = 0.8;

// Pen holder apparatus
const chassis_width = 35+8;
const chassis_len = 35+18-7;
const chassis_thick = 3;
const chassis_armature_housing_thick = 1.5;
const chassis_armature_housing_height = 8;
const chassis_screw_radius = 1.5;
const chassis_screw_pad_x = 19;
const chassis_screw_pad_y = 32;
const chassis_screw_spacing = 6;
const chassis_armature_housing_back_axis_height = 1.8;
const servo_holder_thick = 3.6;
const servo_holder_width = 5;
const servo_holder_height = 11;
const servo_mount_hole_height = 8;
const servo_mount_pad_x = 12; 
const servo_hole_distance = 28;
const servo_screw_radius = 1.1;

// Common -- chassis and armature
const base_width = 8;
const base_len = 18;
const base_lead_width = 2;
const base_lead_len = 3;
const base_lead_pad = 1;
const base_axis_guide_len = 1.5;
const base_axis_guide_depth = 1.5;

// Armature
const armature_width = 4;
const armature_len = 10;
const armature_thick = 3;
const armature_grip_height = armature_thick;
const armature_grip_radius = 4.5;
const armature_grip_thick = 1.5;
const armature_grip_gap = 0.8;
const armature_angle = 3.1415/2;

// Plotter chassis
const plotter_chassis_screw_pad_x = 4.5;
const plotter_chassis_screw_pad_y = 4.5;
const plotter_chassis_thick = chassis_thick;
const plotter_chassis_base_screw_radius = 1.5;
const plotter_chassis_base_height = 105;
//const plotter_chassis_base_height = 10;
const plotter_chassis_base_width = 80;
const plotter_chassis_screw_dist = 62.5;
const plotter_chassis_screw_to_x_end_dist = 72;
const plotter_chassis_bottom_rail_width = 8;
const plotter_chassis_bottom_rail_height = 6.5;
const plotter_chassis_rail_vert_spacing = 7.7;
const plotter_chassis_top_rail_width = 2;
const plotter_chassis_top_rail_height = 2;

// Adapter/stub between pencil holder apparatus and carrier
const pen_stub_width = 12.5;
const pen_stub_len = 18.5;
const pen_stub_thick = 6;
const pen_stub_drill_holes_center_from_bottom = 13;
const pen_stub_support_leg_height = 13;
const pen_stub_support_leg_width = 2.5;
const pen_stub_support_leg_len = 5;


function armatureAndHolder() {
 const holderGeo = geom2.fromPoints([
   [0,0], 
   [base_width,0], 
   [base_width, base_len], 
   [(base_width+armature_width)/2, base_len],
   [(base_width+armature_width)/2+armature_len*Math.cos(armature_angle), 
       base_len+armature_len*Math.sin(armature_angle)],
   [(base_width+armature_width)/2+(armature_len*Math.cos(armature_angle)-armature_width*Math.sin(armature_angle)),
       base_len+(armature_len*Math.sin(armature_angle)+armature_width*Math.cos(armature_angle))],
   [armature_width/2,
       base_len+(armature_len*Math.sin(armature_angle)+armature_width*Math.cos(armature_angle))-
       ((base_width+armature_width)/2+(armature_len*Math.sin(armature_angle)-armature_width*Math.cos(armature_angle))-armature_width/2)],
   [armature_width/2, base_len],
   [0, base_len]
  ]);
 
  const armature = union(
                        translate([0, 0, -armature_thick/2], extrudeLinear({height: armature_thick}, holderGeo)),
                        cuboid({ size: [ base_width+2*base_lead_width, base_lead_len, armature_thick ],
                                 center: [ base_width/2, base_lead_pad+base_lead_len/2, 0 ]}),
                        cuboid({ size: [ base_width+2*base_lead_width, base_lead_len, armature_thick ],
                                 center: [ base_width/2, base_len-base_lead_pad-base_lead_len/2, 0 ]})                                 
                    );

  const etched_armature = subtract(
                              armature,
                              cuboid({ size: [base_width, base_axis_guide_len, base_axis_guide_depth],
                                       center: [base_width/2, base_len/2, (-armature_thick+base_axis_guide_depth)/2] })
                          );

  const gripCenterX = (base_width+armature_width)/2+(armature_len*Math.cos(armature_angle)-armature_width*Math.sin(armature_angle)/2);
  const gripCenterY = base_len+(armature_len+armature_width/2)*Math.sqrt(0.5);

  const grip_nonhollow = subtract(
        cylinder({ 
           height: armature_grip_height, 
           radius: armature_grip_radius+armature_grip_thick,
           center: [ gripCenterX, gripCenterY, 0] }),
        cuboid({ size: [armature_grip_thick*2, armature_grip_gap, armature_grip_height],
                 center: [gripCenterX + armature_grip_radius + armature_grip_thick/2, gripCenterY, 0]}));       



  return subtract(
    union(
      grip_nonhollow,
      etched_armature),
      
      
    cylinder({ 
       height: armature_grip_height*2, 
       radius: armature_grip_radius,
       center: [ gripCenterX, gripCenterY, 0] })
  );
}

function pen_chassis() {
  
  const armature_housing_width = base_width+2*chassis_armature_housing_thick;
  const armature_housing_len =   base_len+2*chassis_armature_housing_thick;

  const armatureHousingCenterX = armature_housing_width/2;
  const armatureHousingCenterY = armature_housing_len/2;  

  const base_plate = subtract(
    // Plate
    cuboid({ size: [chassis_width, chassis_len, chassis_thick ] }),    
    
    // Etch for rubber bands
    cuboid({ size: [base_lead_len, base_lead_len*2+base_lead_pad+chassis_armature_housing_thick, chassis_thick ],
             center: [(chassis_width-base_lead_len)/2-armature_housing_width,
                      (chassis_len-(base_lead_len*2+base_lead_pad+chassis_armature_housing_thick))/2, 
                      0] }),
             
    // Screw drills
    cylinder({ 
      height: chassis_thick*2, 
      radius: chassis_screw_radius,
      center: [ -chassis_width/2+chassis_screw_pad_x, 
                -chassis_len/2+chassis_screw_pad_y, 0] }),

    cylinder({ 
      height: chassis_thick*2, 
      radius: chassis_screw_radius,
      center: [ -chassis_width/2+chassis_screw_pad_x + chassis_screw_spacing, 
               -chassis_len/2+chassis_screw_pad_y, 0] })
    );


  const armature_housing = subtract(
    // Hollow frame
    cuboid({ size: [armature_housing_width, 
                    armature_housing_len,     
                    chassis_armature_housing_height],
             center: [armatureHousingCenterX, 
                      armatureHousingCenterY,
                      0]}),
                      
    cuboid({ size: [base_width+spacing_epsilon, 
                    base_len+spacing_epsilon,     
                    chassis_armature_housing_height],                    
             center: [armatureHousingCenterX, 
                      armatureHousingCenterY,
                      0]}),
    
    // Etches for rubber band lead
    cuboid({ size: [ base_width+2*base_lead_width, 
                      1.5*base_lead_len, chassis_armature_housing_height ],
             center: [ armatureHousingCenterX, 
                         -0.50*base_lead_len+armature_housing_len-chassis_armature_housing_thick-base_lead_pad, 0 ]}),

    // Etch for back axis
    /*cuboid({ size: [ armature_housing_width+spacing_epsilon,
                     base_lead_len*2+base_lead_pad+chassis_armature_housing_thick, 
                     chassis_armature_housing_back_axis_height ],
             center: [ armatureHousingCenterX, 
                       (base_lead_len*2+base_lead_pad+chassis_armature_housing_thick)/2, 
                       (chassis_armature_housing_back_axis_height-chassis_armature_housing_height)/2 ]}),
    */
    translate([armatureHousingCenterX, chassis_armature_housing_thick+base_lead_pad+base_lead_len/2, 0],
      rotate([0, Math.PI/2, 0], 
        cylinder({ radius: (base_lead_len*Math.sqrt(2)+spacing_epsilon/2)/2, 
                   height: armature_housing_width }))),


    // Etch for axis
    cuboid({ size: [ base_width+2*chassis_armature_housing_thick, base_axis_guide_len, chassis_armature_housing_height ],
             center: [ armatureHousingCenterX, chassis_armature_housing_thick+base_len/2, 0 ]}),

    // Front etch for armature
    cuboid({ size: [ 0.75*base_width, chassis_armature_housing_thick, chassis_armature_housing_height ],
             center: [ armatureHousingCenterX, chassis_armature_housing_thick*1.5+base_len, 0 ]}),
  );

  // Servo holder
  const servo_holder = 
    translate([servo_holder_thick/2, 
               servo_holder_width/2, 
               (servo_holder_height+chassis_thick)/2],
      subtract(
        cuboid({ size: [ servo_holder_thick, servo_holder_width, servo_holder_height ] }),
        translate([0, 0, servo_mount_hole_height - servo_holder_height/2],
          rotate([0, Math.PI/2, 0],
              cylinder({ height: servo_holder_thick+spacing_epsilon, 
                          radius: servo_screw_radius })))));
  
  return union(
    base_plate,
    translate([chassis_width/2-armature_housing_width, 
               chassis_len/2-armature_housing_len, 
               (chassis_thick+chassis_armature_housing_height)/2], armature_housing),
    translate([-chassis_width/2 + servo_mount_pad_x - servo_holder_thick, 
                -chassis_len/2, 0], servo_holder),
    translate([-chassis_width/2 + servo_mount_pad_x - servo_holder_thick, 
      -chassis_len/2+servo_hole_distance, 0], servo_holder)
  
  );
}


function plotter_chassis() {
  const base_screw_drill = cylinder({ 
    height: plotter_chassis_thick*2, 
    radius: plotter_chassis_base_screw_radius });
  const chassis_plate = 
    subtract(
      cuboid({size: [plotter_chassis_base_width, plotter_chassis_base_height, plotter_chassis_thick]}),
      translate([-plotter_chassis_base_width/2 + plotter_chassis_screw_pad_x,
                 -plotter_chassis_base_height/2 + plotter_chassis_screw_pad_y], base_screw_drill),
      translate([-plotter_chassis_base_width/2 + plotter_chassis_screw_pad_x,
                 -plotter_chassis_base_height/2 + plotter_chassis_screw_pad_y + plotter_chassis_screw_dist], base_screw_drill)
 
    );
  
  const x_axis_ends_at = plotter_chassis_screw_to_x_end_dist + plotter_chassis_screw_pad_x;
  const rail_width_ofs = plotter_chassis_base_width - x_axis_ends_at;
  const bottom_rail_center_z = (plotter_chassis_thick+plotter_chassis_bottom_rail_height)/2;
  const bottom_rail_total_width = rail_width_ofs+plotter_chassis_bottom_rail_width;
  const chassis_bottom_rail = 
    cuboid({ size: [ bottom_rail_total_width,
                     plotter_chassis_base_height,
                     plotter_chassis_bottom_rail_height ],
             center: [ (plotter_chassis_base_width-bottom_rail_total_width)/2,
                       0,
                       bottom_rail_center_z ]
                       });

  const chassis_top_rail_start_z = bottom_rail_center_z+
                                   plotter_chassis_bottom_rail_height/2+
                                   plotter_chassis_rail_vert_spacing;

  const top_rail_total_width = rail_width_ofs+plotter_chassis_top_rail_width;
  const chassis_top_rail = 
    cuboid({ size: [ top_rail_total_width,
                    plotter_chassis_base_height,
                    plotter_chassis_top_rail_height ],
            center: [ (plotter_chassis_base_width-top_rail_total_width)/2,
                      0,
                      chassis_top_rail_start_z+plotter_chassis_top_rail_height/2 ]
                      });

  const chassis_right_wall = 
    cuboid({ size: [ plotter_chassis_thick,
                    plotter_chassis_base_height,
                    chassis_top_rail_start_z+plotter_chassis_top_rail_height ],
            center: [ (plotter_chassis_base_width-plotter_chassis_thick)/2,
                      0,
                      (chassis_top_rail_start_z+plotter_chassis_top_rail_height)/2 ]
                      });
                                          

  return union(chassis_plate,
               chassis_bottom_rail,
               chassis_top_rail,
               chassis_right_wall);
}


function pen_stub() {
  let pen_stub_support_total_height = pen_stub_support_leg_height + pen_stub_thick;
  return union(  
    subtract(
      cuboid({size: [pen_stub_width, pen_stub_len, pen_stub_thick]}),

      // Screw drills
      cylinder({ 
        height: pen_stub_thick*2, 
        radius: chassis_screw_radius,
        center: [ -chassis_screw_spacing/2, 
                  -pen_stub_len/2 + pen_stub_drill_holes_center_from_bottom, 0] }),

        cylinder({ 
          height: pen_stub_thick*2, 
          radius: chassis_screw_radius,
          center: [ chassis_screw_spacing/2, 
            -pen_stub_len/2 + pen_stub_drill_holes_center_from_bottom, 0] })
    ),

    translate([(pen_stub_width+pen_stub_support_leg_width)/2, 
                (-pen_stub_len+pen_stub_support_leg_len)/2, 
              -(pen_stub_support_total_height-pen_stub_thick)/2],
      cuboid({size: [pen_stub_support_leg_width, pen_stub_support_leg_len, 
                     pen_stub_support_total_height]}))
  )
}
function main() {
  //return armatureAndHolder();
  //return plotter_chassis();
  return pen_chassis();
  //return pen_stub();
  /*return union(    
      pen_chassis(),
      translate([chassis_width/2 - chassis_armature_housing_thick - base_width, 
                  chassis_len/2-chassis_armature_housing_thick-base_len, armature_thick+chassis_armature_housing_height/4], 
        armatureAndHolder()) 
  );*/
} 

module.exports = { main };


