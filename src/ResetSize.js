  function reset_visualization_size(params) {
    run_reset_visualization_size(params);
  }

  function run_reset_visualization_size(params) {

    // reset zoom
    // zoom.two_translate_zoom(0,0,1)
    var zoom_y = 1;
    var zoom_x = 1;
    var pan_dx = 0;
    var pan_dy = 0;


    var half_height = params.viz.clust.dim.height / 2;
    var center_y = -(zoom_y - 1) * half_height;

    // transform clust group
    ////////////////////////////
    // d3.select('#clust_group')
    viz.get_clust_group()
      // first apply the margin transformation
      // then zoom, then apply the final transformation
      .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
      ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [pan_dx,
        pan_dy
      ] + ')');

    // transform row labels
    d3.select('#row_labels')
      .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
      zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

    // transform row_label_triangles
    // use the offset saved in params, only zoom in the y direction
    d3.select('#row_label_triangles')
      .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
      1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

    // transform col labels
    d3.select('#col_labels')
      .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
        pan_dx, 0
      ] + ')');

    // transform col_class
    d3.select('#col_class')
      .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
        pan_dx, 0
      ] + ')');

    // set y translate: center_y is positive, positive moves the visualization down
    // the translate vector has the initial margin, the first y centering, and pan_dy
    // times the scaling zoom_y
    var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;

    // reset the zoom translate and zoom
    params.zoom.scale(zoom_y);
    params.zoom.translate([pan_dx, net_y_offset]);

    // get outer_margins
    if ( params.viz.expand == false ){
      var outer_margins = params.viz.outer_margins;
    } else {
      var outer_margins = params.viz.outer_margins_expand;
    }

    // get the size of the window
    var screen_width  = window.innerWidth;
    var screen_height = window.innerHeight;

    // define width and height of clustergram container
    var cont_dim = {};
    cont_dim.width  = screen_width  - outer_margins.left - outer_margins.right;
    cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

    // size the svg container div - svg_div
    d3.select('#' + params.viz.svg_div_id)
        .style('margin-left', outer_margins.left + 'px')
        .style('margin-top',  outer_margins.top  + 'px')
        .style('width',  cont_dim.width  + 'px')
        .style('height', cont_dim.height + 'px');

    // get height and width from parent div
    params.viz.svg_dim = {};
    params.viz.svg_dim.width  = Number(d3.select('#' + params.viz.svg_div_id).style('width').replace('px', ''));
    params.viz.svg_dim.height = Number(d3.select('#' + params.viz.svg_div_id).style('height').replace('px', ''));


    ///////////////////////////////////////////////////////
    // resizing labels on screen resize will be done later
    ///////////////////////////////////////////////////////

    // // define label scale parameters: the more characters in the longest name, the larger the margin
    // var min_num_char = 5;
    // var max_num_char = params.labels.max_label_char;

    // // define label scale
    // ///////////////////////////
    // var min_label_width = 85;
    // var max_label_width = 140;
    // var label_scale = d3.scale.linear()
    //   .domain([min_num_char, max_num_char])
    //   .range([min_label_width, max_label_width]).clamp('true');

    // // screen_label_scale
    // var screen_label_scale = d3.scale.linear()
    //   .domain([500,1000])
    //   .range([0.5,1.0])
    //   .clamp(true);

    // // Label Scale
    // ///////////////////////
    // // dependent on max char length or row/col labels, screensize,
    // // and user-defined factor
    // params.norm_label.width.row = 1.2*label_scale(params.labels.row_max_char)
    //   * screen_label_scale(params.viz.svg_dim.width)
    //   * params.row_label_scale;

    // params.norm_label.width.col = label_scale(params.labels.col_max_char)
    //   * screen_label_scale(params.viz.svg_dim.height)
    //   * params.col_label_scale;

    /////////////////////////////////////////////

    // reduce width by row/col labels and by grey_border width (reduce width by less since this is less aparent with slanted col labels)
    var ini_clust_width = params.viz.svg_dim.width - (params.labels.super_label_width +
      params.norm_label.width.row + params.class_room.row) - params.viz.grey_border_width - params.viz.spillover_x_offset;

    // there is space between the clustergram and the border
    var ini_clust_height = params.viz.svg_dim.height - (params.labels.super_label_width +
      params.norm_label.width.col + params.class_room.col) - 5 * params.viz.grey_border_width;

    // // the visualization dimensions can be smaller than the svg
    // // columns need to be shrunk for wide screens
    // var min_col_shrink_scale = d3.scale.linear().domain([100,1500]).range([1,0.1]).clamp('true');
    // var min_col_shrink = min_col_shrink_scale(params.viz.svg_dim.width);

    // reduce clustergram width if triangles are taller than the normal width
    // of the columns
    var tmp_x_scale = d3.scale.ordinal().rangeBands([0, ini_clust_width]);
    tmp_x_scale.domain(params.matrix.orders.ini_row);
    var triangle_height = tmp_x_scale.rangeBand()/2 ;
    if (triangle_height > params.norm_label.width.col){
      ini_clust_width = ini_clust_width * ( params.norm_label.width.col/triangle_height );
    }
    params.viz.clust.dim.width = ini_clust_width ;


    // clustergram height
    ////////////////////////
    // ensure that rects are never taller than they are wide
    // force square tiles
    if (ini_clust_width / params.viz.num_col_nodes < ini_clust_height / params.viz.num_row_nodes) {

      // scale the height
      params.viz.clust.dim.height = ini_clust_width * (params.viz.num_row_nodes / params.viz.num_col_nodes);

      // keep track of whether or not a force square has occurred
      // so that I can adjust the font accordingly
      params.viz.force_square = 1;

      // make sure that force_square does not cause the entire visualization
      // to be taller than the svg, if it does, then undo
      if (params.viz.clust.dim.height > ini_clust_height) {
      // make the height equal to the width
      params.viz.clust.dim.height = ini_clust_height;
      // keep track of whether or not a force square has occurred
      params.viz.force_square = 0;
      }
    }
    // do not force square tiles
    else {
      // the height will be calculated normally - leading to wide tiles
      params.viz.clust.dim.height = ini_clust_height;
      // keep track of whether or not a force square has occurred
      params.viz.force_square = 0;
    }

    // zoom_switch from 1 to 2d zoom
    params.viz.zoom_switch = (params.viz.clust.dim.width / params.viz.num_col_nodes) / (params.viz.clust.dim.height / params.viz.num_row_nodes);

    // zoom_switch can not be less than 1
    if (params.viz.zoom_switch < 1) {
      params.viz.zoom_switch = 1;
    }


    // resize the svg
    ///////////////////////
    var svg_group = d3.select('#' + params.viz.svg_div_id)
      .select('svg')
      .attr('id', 'main_svg')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.svg_dim.height);

    // redefine x_scale and y_scale rangeBands
    params.matrix.x_scale.rangeBands([0, params.viz.clust.dim.width]);
    params.matrix.y_scale.rangeBands([0, params.viz.clust.dim.height]);

    // redefine zoom extent
    params.viz.real_zoom = params.norm_label.width.col / (params.matrix.x_scale.rangeBand()/2);
    params.zoom
      .scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch]);

    // redefine border width
    params.viz.border_width = params.matrix.x_scale.rangeBand() / 40;

    // the default font sizes are set here
    params.labels.default_fs_row = params.matrix.y_scale.rangeBand() * 1.01;
    params.labels.default_fs_col = params.matrix.x_scale.rangeBand() * 0.85;

    svg_group.select('#grey_background')
      .attr('width', params.viz.clust.dim.width)
      .attr('height', params.viz.clust.dim.height);

    // resize tiles
    ///////////////////
    svg_group.selectAll('.tile')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', params.matrix.y_scale.rangeBand())
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ',0)';
      });

    svg_group.selectAll('.tile_group')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', params.matrix.y_scale.rangeBand());

    svg_group.selectAll('.row')
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ')';
      });

    svg_group.selectAll('.highlighting_rect')
      .attr('width', params.matrix.x_scale.rangeBand() * 0.80)
      .attr('height', params.matrix.y_scale.rangeBand() * 0.80);

    svg_group.selectAll('.tile_split_up')
      .attr('d', function() {
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand();
        var start_y = 0;
        var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
        var output_string = 'M' + start_x + ',' + start_y + ', L' +
          start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
        return output_string;
      })

    svg_group.selectAll('.tile_split_dn')
      .attr('d', function() {
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand();
        var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
        var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
        var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
          final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
        return output_string;
      })

    // resize click hlight
    var rel_width_hlight = 6;
    var opacity_hlight = 0.85;

    var hlight_width = rel_width_hlight*params.viz.border_width;
    var hlight_height = rel_width_hlight*params.viz.border_width/params.viz.zoom_switch;

    // reposition tile highlight
    ////////////////////////////////

    // top highlight
    d3.select('#top_hlight')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', hlight_height)
      .attr('transform', function() {
        return 'translate(' + params.matrix.x_scale(params.matrix.click_hlight_x) + ',0)';
      });

    // left highlight
    d3.select('#left_hlight')
      .attr('width', hlight_width)
      .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
      .attr('transform', function() {
        return 'translate(' + params.matrix.x_scale(params.matrix.click_hlight_x) + ','+
          hlight_height*0.99+')';
      });

    // right highlight
    d3.select('#right_hlight')
      .attr('width', hlight_width)
      .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
      .attr('transform', function() {
        var tmp_translate = params.matrix.x_scale(params.matrix.click_hlight_x) + params.matrix.x_scale.rangeBand() - hlight_width;
        return 'translate(' + tmp_translate + ','+
          hlight_height*0.99+')';
      });

    // bottom highlight
    d3.select('#bottom_hlight')
      .attr('width', function(){
        return params.matrix.x_scale.rangeBand() - 1.98*hlight_width})
      .attr('height', hlight_height)
      .attr('transform', function() {
        var tmp_translate_x = params.matrix.x_scale(params.matrix.click_hlight_x) + hlight_width*0.99;
        var tmp_translate_y = params.matrix.y_scale.rangeBand() - hlight_height;
        return 'translate(' + tmp_translate_x + ','+
          tmp_translate_y+')';
      });

    // resize row highlight
    /////////////////////////
    d3.select('#row_top_hlight')
      .attr('width',params.viz.svg_dim.width)
      .attr('height',hlight_height)
    d3.select('#row_bottom_hlight')
      .attr('width',params.viz.svg_dim.width)
      .attr('height',hlight_height)
      .attr('transform', function(){
        var tmp_translate_y = params.matrix.y_scale.rangeBand() - hlight_height;
        return 'translate(0,'+tmp_translate_y+')';
      });

    // add text to row/col during resize
    function normal_name(d){
      var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
      if (inst_name.length > params.labels.max_label_char){
        inst_name = inst_name.substring(0,params.labels.max_label_char)+'..';
      }
      return inst_name;
    }

    // resize row labels
    ///////////////////////////

    svg_group.select('#row_container')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.viz.clust.margin.top + ')');

    svg_group.select('#row_container')
      .select('.white_bars')
      .attr('width', params.norm_label.background.row)
      .attr('height', 30*params.viz.clust.dim.height + 'px');

    svg_group.select('#row_container')
      .select('.label_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.selectAll('.row_label_text')
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ')';
      });

    svg_group.selectAll('.row_label_text')
      .select('text')
      .attr('y', params.matrix.y_scale.rangeBand() * 0.75)

    svg_group.selectAll('.row_label_text')
      .select('text')
      .style('font-size', params.labels.default_fs_row + 'px')
      .text(function(d){ return normal_name(d);});

    // change the size of the highlighting rects
    svg_group.selectAll('.row_label_text')
      .each(function() {
        var bbox = d3.select(this)
            .select('text')[0][0]
          .getBBox();
        d3.select(this)
          .select('rect')
          .attr('x', bbox.x * 0.5)
          .attr('y', 0)
          .attr('width', bbox.width * 0.5)
          .attr('height', params.matrix.y_scale.rangeBand())
          .style('fill', function() {
          var inst_hl = 'yellow';
          return inst_hl;
          })
          .style('opacity', function(d) {
          var inst_opacity = 0;
          // highlight target genes
          if (d.target === 1) {
            inst_opacity = 1;
          }
          return inst_opacity;
          });
      });


    // label the widest row and col labels
    params.bounding_width_max = {};
    params.bounding_width_max.row = 0;
    d3.selectAll('.row_label_text').each(function() {
      var tmp_width = d3.select(this).select('text').node().getBBox().width;
      if (tmp_width > params.bounding_width_max.row) {
        params.bounding_width_max.row = tmp_width;
      }
    });

    svg_group.select('#row_label_viz')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.select('#row_label_viz')
      .select('white_bars')
      .attr('width', params.class_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });

    svg_group.selectAll('.row_triangle_group')
      .attr('transform', function(d, index) {
          return 'translate(0, ' + params.matrix.y_scale(index) + ')';
        });

    svg_group.selectAll('.row_triangle_group')
      .select('path')
      .attr('d', function() {
        var origin_x = params.class_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.matrix.y_scale.rangeBand() / 2;
        var final_x = params.class_room.symbol_width - 1;
        var final_y = params.matrix.y_scale.rangeBand();
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      });


      if (Utils.has( params.network_data.row_nodes[0], 'value')) {

        // set bar scale
        var enr_max = Math.abs(_.max( params.network_data.row_nodes, function(d) { return Math.abs(d.value) } ).value) ;
        params.labels.bar_scale_row = d3.scale
          .linear()
          .domain([0, enr_max])
          .range([0, params.norm_label.width.row ]);

        svg_group.selectAll('.row_bars')
          .attr('width', function(d) {
            var inst_value = 0;
            inst_value = params.labels.bar_scale_row( Math.abs(d.value) );
            return inst_value;
          })
          .attr('x', function(d) {
            var inst_value = 0;
            inst_value = -params.labels.bar_scale_row( Math.abs(d.value) );
            return inst_value;
          })
          .attr('height', params.matrix.y_scale.rangeBand() );

      }

      // resize col labels
      ///////////////////////
      svg_group.select('#col_container')
        .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
        params.norm_label.margin.top + ')');

      svg_group.select('#col_container')
        .select('.white_bars')
        .attr('width', 30 * params.viz.clust.dim.width + 'px')
        .attr('height', params.norm_label.background.col);

      svg_group.select('#col_container')
        .select('.label_container')
        .attr('transform', 'translate(0,' + params.norm_label.width.col + ')');

      // offset click group column label
      var x_offset_click = params.matrix.x_scale.rangeBand() / 2 + params.viz.border_width;
      // reduce width of rotated rects
      var reduce_rect_width = params.matrix.x_scale.rangeBand() * 0.36;

      svg_group.selectAll('.col_label_text')
        .attr('transform', function(d, index) {
          return 'translate(' + params.matrix.x_scale(index) + ') rotate(-90)';
        });

      svg_group.selectAll('.col_label_click')
        .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)');

      svg_group.selectAll('.col_label_click')
        .select('text')
        .attr('y', params.matrix.x_scale.rangeBand() * 0.60)
        .attr('dx', 2 * params.viz.border_width)
        .style('font-size', params.labels.default_fs_col + 'px')
        .text(function(d){ return normal_name(d);});


      params.bounding_width_max.col = 0;
      svg_group.selectAll('.col_label_click').each(function() {
        var tmp_width = d3.select(this).select('text').node().getBBox().width;
        if (tmp_width > params.bounding_width_max.col) {
        params.bounding_width_max.col = tmp_width * 1.2;
        }
      });


      // check if widest row or col are wider than the allowed label width
      ////////////////////////////////////////////////////////////////////////
      params.ini_scale_font = {};
      params.ini_scale_font.row = 1;
      params.ini_scale_font.col = 1;

      if (params.bounding_width_max.row > params.norm_label.width.row) {

        // calc reduction in font size
        params.ini_scale_font.row = params.norm_label.width.row / params.bounding_width_max.row;
        // redefine bounding_width_max.row
        params.bounding_width_max.row = params.ini_scale_font.row * params.bounding_width_max.row;

        // redefine default fs
        params.labels.default_fs_row = params.labels.default_fs_row * params.ini_scale_font.row;
        // reduce font size
        d3.selectAll('.row_label_text').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_row + 'px');
        });
      }

      if (params.bounding_width_max.col > params.norm_label.width.col) {

        // calc reduction in font size
        params.ini_scale_font.col = params.norm_label.width.col / params.bounding_width_max.col;
        // redefine bounding_width_max.col
        params.bounding_width_max.col = params.ini_scale_font.col * params.bounding_width_max.col;
        // redefine default fs
        params.labels.default_fs_col = params.labels.default_fs_col * params.ini_scale_font.col;
        // reduce font size
        d3.selectAll('.col_label_click').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_col + 'px');
        });
      }

      svg_group.selectAll('.col_label_click')
        .each(function() {
          var bbox = d3.select(this)
            .select('text')[0][0]
            .getBBox();
          d3.select(this)
            .select('rect')
            .attr('x', bbox.x * 1.25)
            .attr('y', 0)
            .attr('width', bbox.width * 1.25)
            .attr('height', params.matrix.x_scale.rangeBand() * 0.6)
            .style('fill', 'yellow')
            .style('opacity', 0);
        });

      svg_group.selectAll('.col_label_click')
        .select('path')
        .attr('d', function() {
          // x and y are flipped since its rotated
          var origin_y = -params.viz.border_width;
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand() - reduce_rect_width;
          var start_y = -(params.matrix.x_scale.rangeBand() - reduce_rect_width +
          params.viz.border_width);
          var final_y = -params.viz.border_width;
          var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' +
            start_x + ', L ' + final_y + ',' + final_x + ' Z';
          return output_string;
        })
        .attr('fill', function(d) {
          var inst_color = '#eee';
          if (params.labels.show_categories) {
            inst_color = params.labels.class_colors.col[d.cl];
          }
          return inst_color;
        });


      // get max value
      var enr_max = Math.abs(_.max( params.network_data.col_nodes, function(d) { return Math.abs(d.value) } ).value) ;
      var enr_min = Math.abs(_.min( params.network_data.col_nodes, function(d) { return Math.abs(d.value) } ).value) ;

      // the enrichment bar should be 3/4ths of the height of the column labels
      params.labels.bar_scale_col = d3.scale
        .linear()
        .domain([enr_min*0.75, enr_max])
        .range([0, params.norm_label.width.col]);

      // append column value bars
      if (Utils.has( params.network_data.col_nodes[0], 'value')) {

        svg_group.selectAll('.col_bars')
          .attr('width', function(d) {
            var inst_value = 0;
            if (d.value > 0){
              inst_value = params.labels.bar_scale_col(d.value);
            }
            return inst_value;
          })
          // rotate labels - reduce width if rotating
          .attr('height', params.matrix.x_scale.rangeBand() * 0.66);
      }

      // resize dendrogram
      ///////////////////
      svg_group.selectAll('.row_class_rect')
        .attr('width', function() {
          var inst_width = params.class_room.symbol_width - 1;
          return inst_width + 'px';
        })
        .attr('height', params.matrix.y_scale.rangeBand())
        .attr('x', function() {
          var inst_offset = params.class_room.symbol_width + 1;
          return inst_offset + 'px';
        });

      svg_group.selectAll('.col_class_rect')
        .attr('width', params.matrix.x_scale.rangeBand())
        .attr('height', function() {
          var inst_height = params.class_room.col - 1;
          return inst_height;
        });

      svg_group.selectAll('.col_class_group')
        .attr('transform', function(d, index) {
          return 'translate(' + params.matrix.x_scale(index) + ',0)';
        });

      // reposition grid lines
      ////////////////////////////
      svg_group.selectAll('.horz_lines')
        .attr('transform', function(d, index) {
          return 'translate(0,' + params.matrix.y_scale(index) + ') rotate(0)';
        })

      svg_group.selectAll('.horz_lines')
        .select('line')
        .attr('x2',params.viz.clust.dim.width)
        .style('stroke-width', params.viz.border_width/params.viz.zoom_switch+'px')

      svg_group.selectAll('.vert_lines')
        .attr('transform', function(d, index) {
            return 'translate(' + params.matrix.x_scale(index) + ') rotate(-90)';
        });

      svg_group.selectAll('.vert_lines')
        .select('line')
        .attr('x2', -params.viz.clust.dim.height)
        .style('stroke-width', params.viz.border_width + 'px');

    // resize superlabels
    /////////////////////////////////////
    svg_group.select('#super_col_bkg')
      .attr('height', params.labels.super_label_width + 'px')
      .attr('transform', 'translate(0,' + params.viz.grey_border_width + ')');

    // super col title
    svg_group.select('#super_col')
      .attr('transform', function() {
        var inst_x = params.viz.clust.dim.width / 2 + params.norm_label.width
          .row;
        var inst_y = params.labels.super_label_width - params.viz.uni_margin;
        return 'translate(' + inst_x + ',' + inst_y + ')';
      });

    // super row title
    svg_group.select('#super_row_bkg')
      .attr('width', params.labels.super_label_width + 'px')
      .attr('transform', 'translate(' + params.viz.grey_border_width + ',0)');

    // append super title row group
    svg_group.select('#super_row')
      .attr('transform', function() {
        var inst_x = params.labels.super_label_width - params.viz.uni_margin;
        var inst_y = params.viz.clust.dim.height / 2 + params.norm_label.width
          .col;
        return 'translate(' + inst_x + ',' + inst_y + ')';
      });

    // // super row label (rotate the already translated title )
    // d3.select('#super_row_label')
    //   .append('text')
    //   .text(params.labels.super.row)
    //   .attr('text-anchor', 'center')
    //   .attr('transform', 'rotate(-90)')
    //   .style('font-size', '14px')
    //   .style('font-weight', 300);

    // resize spillover
    //////////////////////////

    // hide spillover from slanted column labels on right side
    svg_group.select('#right_slant_triangle')
      .attr('transform', 'translate(' + params.viz.clust.dim.width + ',' +
      params.norm_label.width.col + ')');

    svg_group.select('#left_slant_triangle')
      .attr('transform', 'translate(-1,' + params.norm_label.width.col +')');

    svg_group.select('#top_left_white')
      .attr('width', params.viz.clust.margin.left)
      .attr('height', params.viz.clust.margin.top);

    svg_group.select('#right_spillover')
      .attr('transform', function() {
        var tmp_left = params.viz.clust.margin.left + params.viz.clust.dim.width;
        var tmp_top = params.norm_label.margin.top + params.norm_label.width
          .col;
        return 'translate(' + tmp_left + ',' + tmp_top + ')';
      });


    // white border bottom - prevent clustergram from hitting border
    svg_group.select('#bottom_spillover')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', 2 * params.viz.grey_border_width)
      .attr('transform', function() {
        // shift up enough to show the entire border width
        var inst_offset = params.viz.svg_dim.height - 3 * params.viz.grey_border_width;
        return 'translate(0,' + inst_offset + ')';
      });


    // add border to svg in four separate lines - to not interfere with clicking anything
    ///////////////////////////////////////////////////////////////////////////////////////

    // left border
    svg_group.select('#left_border')
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', 'translate(0,0)');

    // right border
    svg_group.select('#right_border')
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', function() {
        var inst_offset = params.viz.svg_dim.width - params.viz.grey_border_width;
        return 'translate(' + inst_offset + ',0)';
      });

    // top border
    svg_group.select('#top_border')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
        var inst_offset = 0;
        return 'translate(' + inst_offset + ',0)';
      });

    // bottom border
    svg_group.select('#bottom_border')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
        var inst_offset = params.viz.svg_dim.height - params.viz.grey_border_width;
        return 'translate(0,' + inst_offset + ')';
      });



    // reset zoom and translate
    //////////////////////////////
    params.zoom.scale(1).translate(
        [ params.viz.clust.margin.left, params.viz.clust.margin.top]
    );

    d3.select('#main_svg').style('opacity',1);
  }