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

// Function Name: cell
// Description: constructor for creating cell objects
function cell(id) {
    this.clickState = false;
    this.cellID = id;
};
// ///////////////////////////////////////////////////////////////////////////////////////

// Grid editor functions

// Function Name: generateGrid
// Description: Produces a 11x11 grid consisting of 20x20 px div cells
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

// Function Name: generateAxisLabels
// Description: Creates x and y axis grid labels Note: axis origin is top right corner
graphicEditor.generateAxisLabels = function() {
    // Generate x and y axis labels
    $('#grid').append('<div class="col" id="yaxis"></div');
    for (var i = 0; i <= (this.numRows - 1); i++) {
        $('#yaxis').append('<div class="labelcell">' + i + '</div>');
        $('#col_' + i).append('<div class="labelcell">' + i + '</div>');
    };
};

//Function Name: updateGridView
//Description: updates the class of each div cell based on the state in the grid data model
graphicEditor.updateGridView = function() {
    for (var cell in this.gridModel) {
         if (this.gridModel[cell].clickState === true)    {      
                 $('#'+this.gridModel[cell].cellID).addClass('selectedgridcell');
         } else if (this.gridModel[cell].clickState === false) {
                 $('#'+this.gridModel[cell].cellID).removeClass('selectedgridcell');
         };
     };
};
// ///////////////////////////////////////////////////////////////////////////////////////


// Grid Model functions

// Function Name: initiateGridModel
// Description: Initiate grid model with unselected cell values
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

// Function Name: resetGridModel
// Description: Reset the grid model to the initial values. 
graphicEditor.resetGridModel = function() {
    // Iterate through all grid cells and set click state to false
    for (var cell in this.gridModel) {
        this.gridModel[cell].clickState = false;
    };
};

// Function Name: updateGridModel
// Description: updates cell object properties
graphicEditor.updateGridModel = function(update) {
    var cellID = update.cellID;
    var clickState = update.clickState;
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
// ///////////////////////////////////////////////////////////////////////////////////////


// Event handling functions

// Function Name: gridEventListener
// Description: Initiate each of the event listener functions
graphicEditor.gridEventListener = function() {
    this.selectCell();
    this.mouseoverCell();  
    this.unselectCell();    
    this.fillColourChange();
    this.fillOpacityChange();
    this.strokeColourChange();
    this.strokeOpacityChange();
    this.symbolSizeChange();
};

// Function Name: selectCell
// Description: Performs required tasks when a cell is selected. 
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

// Function Name: unselectCell
// Description: Performs required tasks when a cell is unselected
graphicEditor.unselectCell = function() {
    $('.gridcell').mouseout( function() {    
        var cellID = $(this).attr('id');       
        $(this).toggleClass('mouseovergridcell');        
    });  
};

// Function Name: mouseoverCell
// Description: Performs required tasks when a cell is mouseover
graphicEditor.mouseoverCell = function() {
    $('.gridcell').mouseover( function() {    
        var cellID = $(this).attr('id');      
        $(this).toggleClass('mouseovergridcell');        
    });
};

// Function Name: fillColourChange
// Description: Update the fill colour of the map style
graphicEditor.fillColourChange = function() {
    $('#fillColourSelector').change(function() {
        graphicEditor.defaultStyle.defaultStyle.fillColor = $('#fillColourSelector').val();
        graphicEditor.previewGraphic();
    });
};

//Function Name: fillOpacityChange
//Description: Update the fill opacity
graphicEditor.fillOpacityChange = function() {
 $('#fillOpacitySelector').change(function() {
     graphicEditor.defaultStyle.defaultStyle.fillOpacity = $('#fillOpacitySelector').val();
     graphicEditor.previewGraphic();
 });
};

// Function Name: strokeColourChange
// Description: Update the stroke colour of the map style
graphicEditor.strokeColourChange = function() {
    $('#strokeColourSelector').change(function() {
        graphicEditor.defaultStyle.defaultStyle.strokeColor = $('#strokeColourSelector').val();
        graphicEditor.previewGraphic();
    });
};

//Function Name: strokeOpacityChange
//Description: Update the stroke opacity
graphicEditor.strokeOpacityChange = function() {
 $('#strokeOpacitySelector').change(function() {
     graphicEditor.defaultStyle.defaultStyle.strokeOpacity = $('#strokeOpacitySelector').val();
     graphicEditor.previewGraphic();
 });
};

// Function Name: symbolSizeChange
// Description: Update the symbol size
graphicEditor.symbolSizeChange = function() {
    $('#pointRadiusSelector').change(function() {
        graphicEditor.defaultStyle.defaultStyle.pointRadius = $('#pointRadiusSelector').val();
        graphicEditor.previewGraphic();
    });
};
// ///////////////////////////////////////////////////////////////////////////////////////



// Function Name: calcSlope
// Description: calculates slope between two sets of points
graphicEditor.calcSlope = function(x1,y1,x2,y2) {
    var rise = y2-y1;
    var run = x2-x1;
    var slope = rise/run;
    return slope;
};

//Function Name: calcIntercept
//Description: calculates y intercept
graphicEditor.calcIntercept = function(x,y,m) {
    var b = y - (m*x);
    return b;
};

//Function Name: calcY
//Description: calculates y value
graphicEditor.calcY = function(x,m,b) {
    var y = Math.round((m*x)+b);
    return y;
};

//Function Name: calcY
//Description: calculates x value
graphicEditor.calcX = function(y,m,b) {
    var x = Math.round((y-b)/m);  
    return x;
};

// Function Name: connectPoints
// Description: determines which grid cells between two points need to be set to clickState to true
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
// ///////////////////////////////////////////////////////////////////////////////////////


// Control interface functions

// Function Name: updateClickSummary
// Description: update the click summary string
graphicEditor.updateClickSummary = function(coords) {
    var newCoordsPair = coords[0] + "," + coords[1];
    if (this.userClickSummary === "") {
        this.userClickSummary = this.userClickSummary + newCoordsPair;        
    } else {
        this.userClickSummary = this.userClickSummary + "," + newCoordsPair;
    };
};

// Function Name: updateTextarea
// Description: updates value of the input form textarea element
graphicEditor.updateTextarea = function() {
    $('#clickSummary').val("[" + this.userClickSummary + "]");
};

// Function Name: reset
// Description: calls functions to reset the model and view for the user
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
// ///////////////////////////////////////////////////////////////////////////////////////

// Preview map functions

//Function Name: initDefaultStyle
//Description: initiate the default style of a symbol
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

// Function Name: initPreviewMap
// Description: Initiates the preview map
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

// Function Name: updatePreviewSymbol
// Description: update the preview symbol 
graphicEditor.updatePreviewSymbol = function() {
    eval('OpenLayers.Renderer.symbol.previewSymbol =' + $('#clickSummary').val());
};

// Function Name: previewGraphic
// Description: show preview graphic point
graphicEditor.previewGraphic = function() {
    
    if ($('#clickSummary').val() != '[]') {
        //remove any graphic symbols on map prior to adding a new one
        this.removePreviewGraphic();
        
        this.pointLayer = new OpenLayers.Layer.Vector('Point layer', {
            styleMap: this.appStyleMap        
        });
        this.map.addLayer(this.pointLayer);
        
        //update Graphic symbol
        this.updatePreviewSymbol();
        
        // create and add point to tempPointLayer
        this.point = new OpenLayers.Geometry.Point(-75.69953, 45.38076);
        this.point.transform(this.WGS84, this.mercator);
        this.pointFeature = new OpenLayers.Feature.Vector(this.point, null);                    
        this.pointLayer.addFeatures([this.pointFeature]); 
    };
};

// Function Name: removePreviewGraphic
// Description: removes the preview graphic symbol from the map
graphicEditor.removePreviewGraphic = function() {
    if (this.pointFeature != null) {
        this.pointLayer.destroyFeatures([this.pointFeature]);
    };
}
// ///////////////////////////////////////////////////////////////////////////////////////


// Function name: start
// Description: calls required functions to start graphic editor. 
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

// Start editor
graphicEditor.start();