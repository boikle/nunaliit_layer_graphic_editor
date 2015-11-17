/*
Copyright (c) 2015, Robert Oikle
All rights reserved.
*/

var graphicEditor = graphicEditor || {
    gridModel: [],
    numColumns: 11,
    numRows: 11,
    userClickSummary: "", 
    map: null,
    mercator: null,
    WGS84: null,
    centerPosition: null,
    defaultStyle: null,
    appStyleMap: null,
    pointLayer: null,
    point: null,
    pointFeature: null
};

// Constructors //////////////////////////////////////////////////////////////////////////
/**
 * Constructor for creating cell objects
 * @param {string} id the css id of grid cell
 */ 
function cell(id) {
    this.clickState = false;
    this.cellID = id;
};

// Grid editor functions /////////////////////////////////////////////////////////////////
/**
 * Produces a 11x11 grid consisting of 20x20 px div cells
 */ 
graphicEditor.generateGrid = function() {
    var numColumns = this.numColumns;
    var numRows = this.numRows;
    for (var i = 0; i < numRows; i++) {
        $('#grid').append('<div class="col" id="col_'+ i +'"></div');
        for (var j = 0; j < numColumns; j++) {
            $('#col_' + i).append('<div class="gridcell" id="' + i + "_" + j +'"></div>');
        };
    };
};

/**
 * Creates the x and y axis grid labels
 * Note: axis origin is top right corner
 */
graphicEditor.generateAxisLabels = function() {
    // Generate x and y axis labels
    $('#grid').append('<div class="col" id="yaxis"></div');
    for (var i = 0; i <= (this.numRows - 1); i++) {
        $('#yaxis').append('<div class="labelcell">' + i + '</div>');
        $('#col_' + i).append('<div class="labelcell">' + i + '</div>');
    };
};

/**
 * Updates the class of each div cell based on the state in the grid data model
 */
graphicEditor.updateGridView = function() {
    for (var cell in this.gridModel) {
         if (this.gridModel[cell].clickState === true)    {      
                 $('#'+this.gridModel[cell].cellID).addClass('selectedgridcell');
         } else if (this.gridModel[cell].clickState === false) {
                 $('#'+this.gridModel[cell].cellID).removeClass('selectedgridcell');
         };
     };
};

// Grid Model functions //////////////////////////////////////////////////////////////////
/**
 * Initiate grid model with unselected cell values
 */
graphicEditor.initiateGridModel = function() {
    var gridModel = this.gridModel;
    var numColumns = this.numColumns;
    var numRows = this.numRows;  
    for (var i = 0; i < numRows; i ++) {
        for(var j = 0; j < this.numColumns; j ++) {
            var cellModel = new cell(i + "_" + j);
            gridModel.push(cellModel);  
        };      
    };
};

/**
 * Reset the grid model to the initial values. 
 */
graphicEditor.resetGridModel = function() {
    // Iterate through all grid cells and set click state to false
    for (var cell in this.gridModel) {
        this.gridModel[cell].clickState = false;
    };
};

/**
 * Updates cell object properties.
 * @param {Object} updatedCell object containing the details of cell which needs to be updated
 */
graphicEditor.updateGridModel = function(updatedCell) {
    var cellID = updatedCell.cellID;
    var clickState = updatedCell.clickState;
    var updateGrid = false;
    
    for (var cell in this.gridModel) {
        // if cell was not previously clicked, the clickState is set to true
        // else if cell was previously clicked, the clickState reverts to false.
        if (cellID === this.gridModel[cell].cellID && this.gridModel[cell].clickState === false) {
            this.gridModel[cell].clickState = true;
            updateGrid = true;
        }; 
    };    
    if (updateGrid) {
        graphicEditor.updateGridView();
    };
};

// Event handling functions //////////////////////////////////////////////////////////////
/**
 * Initiates a number of functions used for event listing. 
 */
graphicEditor.gridEventListener = function() {
    this.selectCell();
    this.mouseoverCell();  
    this.mouseoutCell();    
    this.fillColourChange();
    this.fillOpacityChange();
    this.strokeColourChange();
    this.strokeOpacityChange();
    this.symbolSizeChange();
};

/**
 * Determines what cell is being clicked and reports its state 
 * as being clicked.
 */
graphicEditor.selectCell = function() {
    $('.gridcell').click( function() { 
        var cellID = $(this).attr('id');
        
        // define update
        var update = {
          cellID:cellID,       
          clickState:true
        };
        // execute grid model update
        graphicEditor.updateGridModel(update);
        // update clickSummary
        var coordPairs = cellID.split("_");
        graphicEditor.updateClickSummary(coordPairs);
        // update textArea
        graphicEditor.updateTextarea();
        // set required cells as clicked to connect points
        graphicEditor.connectPoints();
    });
};

/**
 * toggles the css mouseovergridcell class when a user
 * moves their mouse off a grid cell.
 */
graphicEditor.mouseoutCell = function() {
    $('.gridcell').mouseout( function() {    
        var cellID = $(this).attr('id');       
        $(this).toggleClass('mouseovergridcell');        
    });  
};

/**
 * toggles the css mouseovergridcell class when a user
 * moves their mouse over a grid cell.
 */
graphicEditor.mouseoverCell = function() {
    $('.gridcell').mouseover( function() {    
        var cellID = $(this).attr('id');      
        $(this).toggleClass('mouseovergridcell');        
    });
};

/**
 * Update the fill colour of the default map style 
 * when the fill colour selector is changed.
 */
graphicEditor.fillColourChange = function() {
    $('#fillColourSelector').change(function() {
        graphicEditor.defaultStyle.defaultStyle.fillColor = $('#fillColourSelector').val();
        graphicEditor.previewGraphic();
    });
};

/**
 * Update the fill opacity of the default map style 
 * when the fill opacity selector is changed.
 */
graphicEditor.fillOpacityChange = function() {
 $('#fillOpacitySelector').change(function() {
     graphicEditor.defaultStyle.defaultStyle.fillOpacity = $('#fillOpacitySelector').val();
     graphicEditor.previewGraphic();
 });
};

/**
 * Update the stroke colour of the default map style 
 * when the stroke colour selector is changed.
 */
graphicEditor.strokeColourChange = function() {
    $('#strokeColourSelector').change(function() {
        graphicEditor.defaultStyle.defaultStyle.strokeColor = $('#strokeColourSelector').val();
        graphicEditor.previewGraphic();
    });
};

/**
 * Update the stroke opacity of the default map style when the 
 * stroke opacity selector is changed.
 */
graphicEditor.strokeOpacityChange = function() {
 $('#strokeOpacitySelector').change(function() {
     graphicEditor.defaultStyle.defaultStyle.strokeOpacity = $('#strokeOpacitySelector').val();
     graphicEditor.previewGraphic();
 });
};

/**
 * Update the point radius of the default map style when the 
 * point radius selector is changed.
 */
graphicEditor.symbolSizeChange = function() {
    $('#pointRadiusSelector').change(function() {
        graphicEditor.defaultStyle.defaultStyle.pointRadius = $('#pointRadiusSelector').val();
        graphicEditor.previewGraphic();
    });
};

// Geometry functions ////////////////////////////////////////////////////////////////////
/**
 * Calculates the slope of a straight line
 * using the equation slope = delta y/delta x
 * @param {number} x1 the first x value
 * @param {number} y1 the first y value
 * @param {number} x2 the second x value
 * @param {number} y2 the second y value
 * @return {number} the slope of line
 */
graphicEditor.calcSlope = function(x1,y1,x2,y2) {
    var rise = y2-y1;
    var run = x2-x1;
    var slope = rise/run;
    return slope;
};

/**
 * Calculates the y intercept
 * using the equation b = y - (m * x)
 * @param {number} x the x value
 * @param {number} y the y value
 * @param {number} m the slope
 * @return {number} the value of the y intercept
 */
graphicEditor.calcIntercept = function(x,y,m) {
    var b = y - (m*x);
    return b;
};

/**
 * Calculates the y value for a linear equation
 * using the equation y = (m*x)+b
 * @param {number} x the x value
 * @param {number} m the slope
 * @param {number} b the y intercept
 * @return {number} the value of y
 */
graphicEditor.calcY = function(x,m,b) {
    var y = Math.round((m*x)+b);
    return y;
};

/**
 * Calculates the x value for a linear equation
 * using the equation x = (y - b)/m
 * @param {number} y the y value
 * @param {number} m the slope
 * @param {number} b the y intercept
 * @return {number} the value of x
 */
graphicEditor.calcX = function(y,m,b) {
    var x = Math.round((y-b)/m);  
    return x;
};

/**
 * Calculates which cells need to set as being clicked, 
 * in order to connect to points together on a grid
 */
graphicEditor.connectPoints = function() {
    eval("var clickSummary =" + $('#clickSummary').val());
    
    if (clickSummary.length >= 4) {        
        //determine coordinates of last two points
        var x1 = clickSummary[clickSummary.length - 4];
        var y1 = clickSummary[clickSummary.length - 3];
        var x2 = clickSummary[clickSummary.length - 2];
        var y2 = clickSummary[clickSummary.length - 1];
        var m = this.calcSlope(x1,y1,x2,y2);
        var b = this.calcIntercept(x1, y1, m);
        
        // update grid model to connect between points
        if (x1 === x2) {
            if (y1 < y2) {
                for (var i = y1; i < y2; i ++)
                {
                    var currentCell = x1 + "_" + i;
                    var update = {
                            cellID:currentCell,       
                            clickState:true 
                    };
                    graphicEditor.updateGridModel(update);
                }; 
            } else {
                for (var i = y2; i < y1; i ++)
                {
                    var currentCell = x1 + "_" + i;
                    var update = {
                            cellID:currentCell,       
                            clickState:true 
                    };
                    graphicEditor.updateGridModel(update);
                }; 
            };
        } else if (y1 === y2) {
            if (x1 < x2) {
                for (var i = x1; i < x2; i ++)
                {
                    var currentCell = i + "_" + y1;
                    var update = {
                            cellID:currentCell,       
                            clickState:true 
                    };
                    graphicEditor.updateGridModel(update);
                }; 
            } else {
                for (var i = x2; i < x1; i ++)
                {
                    var currentCell = i + "_" + y1;
                    var update = {
                            cellID:currentCell,       
                            clickState:true 
                    };
                    graphicEditor.updateGridModel(update);
                }; 
            };
            
        } else if (x1 != x2 || y1 != y2) {
            if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
                if (x1 > x2) {
                    var highX = x1;
                    var lowX = x2;
                } else {
                    var highX = x2;
                    var lowX = x1;
                };                
                for (var i = lowX + 1; i != highX; i++) {
                    var y = this.calcY(i,m,b);
                    var currentCell = i + "_" + y;
                    var update = {
                          cellID:currentCell,       
                          clickState:true 
                    };
                    graphicEditor.updateGridModel(update);                 
                };
            } else {
                if (y1 > y2) {
                    var highY = y1;
                    var lowY = y2;
                } else {
                    var highY = y2;
                    var lowY = y1;
                };  
                for (var i = lowY + 1; i != highY; i++) {
                    var x = this.calcX(i,m,b);
                    var currentCell = x + "_" + i;
                    var update = {
                          cellID:currentCell,       
                          clickState:true 
                    };
                    graphicEditor.updateGridModel(update);              
                };                
            };
        };
    };    
};

// Control interface functions ///////////////////////////////////////////////////////////

/**
 * Update the click summary string to include the newly clicked coordinate values
 * @param {array} coords the coordinate pair for clicked cell
 */
graphicEditor.updateClickSummary = function(coords) {
    var newCoordsPair = coords[0] + "," + coords[1];
    if (this.userClickSummary === "") {
        this.userClickSummary = this.userClickSummary + newCoordsPair;        
    } else {
        this.userClickSummary = this.userClickSummary + "," + newCoordsPair;
    };
};

/**
 * Updates value of the input form textarea element
 */
graphicEditor.updateTextarea = function() {
    $('#clickSummary').val("[" + this.userClickSummary + "]");
};

/**
 * Resets both the model and view for the user
 */
graphicEditor.reset = function() {
    // Reset grid model
    graphicEditor.resetGridModel();
    
    // Reset click summary 
    this.userClickSummary = "";
    graphicEditor.updateTextarea();
    
    // Update Grid view
    graphicEditor.updateGridView(); 
    
    // Remove point layers from map
    graphicEditor.removePreviewGraphic();
    
    // Reset fill colour
    this.defaultStyle.defaultStyle.fillColor = '#0000FF';
    $('#fillColourSelector').val('#0000FF');
    
    // Reset fill opacity
    this.defaultStyle.defaultStyle.fillOpacity = 0.3;
    $('#fillOpacitySelector').val(0.3);
    
    // Reset stroke colour
    this.defaultStyle.defaultStyle.strokeColor = '#000F76';
    $('#strokeColourSelector').val('#000F76');
    
    // Reset stroke opacity
    this.defaultStyle.defaultStyle.strokeOpacity = 1;
    $('#strokeOpacitySelector').val(1);
    
    // Reset point radius
    this.defaultStyle.defaultStyle.pointRadius = 12;
    $('#pointRadiusSelector').val(12);
};

// Preview map functions /////////////////////////////////////////////////////////////////

/**
 * Initiate the default style of a symbol
 */
graphicEditor.initDefaultStyle = function() {
 this.defaultStyle = new OpenLayers.Style({
     graphicName: "previewSymbol",
     fillColor: '#0000FF',
     strokeColor: '#000F76',
     strokeOpacity: 1.0,
     fillOpacity: 0.3,
     pointRadius: 12
 });    
};

/**
 * Initiates the OpenLayers 2 preview map
 */
graphicEditor.initPreviewMap = function() {
    this.map = new OpenLayers.Map('map');
    this.mercator = new OpenLayers.Projection("EPSG:900913"); 
    this.WGS84 = new OpenLayers.Projection("EPSG:4326");
    this.centerPosition = new OpenLayers.LonLat(-75.69953, 45.38076);
    
    // define background layer
    var osm = new OpenLayers.Layer.OSM( "Open Street Map");
    this.map.addLayers([osm]); 
    
    // define center position and zoom level
    this.map.setCenter(this.centerPosition.transform(this.WGS84, this.mercator), 10);
    
    //initiate default graphic style
    this.initDefaultStyle
    
    this.appStyleMap = new OpenLayers.StyleMap({
        default: this.defaultStyle
    });
};

/**
 * Preview symbol appearance based on the contents of the click summary
 */
graphicEditor.previewGraphic = function() {
    
    if ($('#clickSummary').val() != '[]') {
        //remove any graphic symbols on map prior to adding a new one
        this.removePreviewGraphic();
        
        this.pointLayer = new OpenLayers.Layer.Vector('Point layer', {
            styleMap: this.appStyleMap        
        });
        this.map.addLayer(this.pointLayer);
        
        //update Graphic symbol
        eval('OpenLayers.Renderer.symbol.previewSymbol =' + $('#clickSummary').val());
        //this.updatePreviewSymbol();
        
        // create and add point to tempPointLayer
        this.point = new OpenLayers.Geometry.Point(-75.69953, 45.38076);
        this.point.transform(this.WGS84, this.mercator);
        this.pointFeature = new OpenLayers.Feature.Vector(this.point, null);                    
        this.pointLayer.addFeatures([this.pointFeature]); 
    };
};

/**
 * Removes the preview graphic symbol from the map
 */
graphicEditor.removePreviewGraphic = function() {
    if (this.pointFeature != null) {
        this.pointLayer.destroyFeatures([this.pointFeature]);
    };
}

// Start graphic editor //////////////////////////////////////////////////////////////////
/**
 * Calls required functions to start graphic editor. 
 */
graphicEditor.start = function() {
    // Create div grid  
    this.generateGrid();
    // Add grid axis labels
    this.generateAxisLabels();
    // Initiate grid data model
    this.initiateGridModel();
    // Grid event listener
    this.gridEventListener();
    // Initiate default style of point
    this.initDefaultStyle();
    // Initiate OpenLayers 2 preview map
    this.initPreviewMap();
    // Set text area
    this.updateTextarea();
};

graphicEditor.start();