var graphicEditor = graphicEditor || {
    gridModel: [],
    numColumns: 10,
    numRows: 10,
    userClickSummary: "", 
    map: null,
    mercator: null,
    WGS84: null,
    centerPosition: null
};

// Function Name: cell
// Description: constructor for creating cell objects
function cell(id) {
    this.clickState = false;
    this.cellID = id;
};

// Function Name: generateGrid
// Description: Produces a 10x10 grid consisting of 20x20 div cells
graphicEditor.generateGrid = function() {
    var numColumns = this.numColumns;
    var numRows = this.numRows;
    for (var i = numColumns; i > 0; i--) {
        $('#grid').append('<div class="col" id="col_'+ (i-1) +'"></div');
        for (var j = 0; j < numRows; j++) {
            $('#col_' + (i-1)).append('<div class="gridcell" id="' + j + "_" + (i-1) +'"></div>');
        };
    };
};

// Function Name: generateAxisLabels
// Description: Creates x and y axis grid labels Note: axis origin is top right corner
graphicEditor.generateAxisLabels = function() {
    // Generate x and y axis labels
    $('#grid').append('<div class="col" id="yaxis"></div');
    for (var i = 0; i <= 9; i++) {
        $('#yaxis').append('<div class="labelcell">' + i + '</div>');
        $('#col_' + i).append('<div class="labelcell">' + i + '</div>');
    };
};

// Function Name: initiateGridModel
// Description: Initiate grid model with unselected cell values
graphicEditor.initiateGridModel = function() {
    var gridModel = this.gridModel;
    var numColumns = this.numColumns;
    var numRows = this.numRows;  
    for (var i = 0; i < numRows; i ++) {
        for(var j = 0; j < numColumns; j ++) {
            var cellModel = new cell(j + "_" + i);
            gridModel.push(cellModel);  
        };      
    };
};

// Function Name: resetGridModel
// Description: Reset the grid model to the initial values. 
graphicEditor.resetGridmodel = function() {
    // Iterate through all grid cells and set click state to false
    for (var cell in this.gridModel) {
        this.gridModel[cell].clickState = false;
    };
    // Reset click summary 
    this.userClickSummary = "";
    graphicEditor.updateTextarea();
    
    // Update Grid view
    graphicEditor.updateGridView();    
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
        } else if (cellID === this.gridModel[cell].cellID && this.gridModel[cell].clickState === true){
            this.gridModel[cell].clickState = false;
            updateGrid = true;
        };     
    };    
    if (updateGrid) {
        graphicEditor.updateGridView();
    };
};

// Function Name: updateGridView
// Description: updates the class of each div cell based on the state in the grid data model
graphicEditor.updateGridView = function() {
    for (var cell in this.gridModel) {
        if (this.gridModel[cell].clickState === true)    {      
                    $('#'+this.gridModel[cell].cellID).addClass('selectedgridcell');
        } else if (this.gridModel[cell].clickState === false) {
                    $('#'+this.gridModel[cell].cellID).removeClass('selectedgridcell');
        };
    };
};

// Function Name: gridEventListener
// Description: Initiate each of the event listener functions
graphicEditor.gridEventListener = function() {
    // Handler for clicking on grid cells
    this.selectCell();
    // Handler for hovering over grid cells
    this.mouseoverCell();  
    // Handler for hovering off grid cells
    this.unselectCell();
};

// Function Name: selectCell
// Description: Performs required tasks when a cell is selected. 
graphicEditor.selectCell = function() {
    $('.gridcell').click( function() { 
        var cellID = $(this).attr('id');
        // window.console.log("Cell ID: " + cellID + " mouse click event");
        
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

// Function Name: updateClickSummary
// Description: update the click summary string
graphicEditor.updateClickSummary = function(coords) {
    var newCoordsPair = coords[1] + "," + coords[0];
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

// Function Name: initPreviewMap
// Description: Initiates the preview map
graphicEditor.initPreviewMap = function() {
    this.map = new OpenLayers.Map('map');
    this.mercator = new OpenLayers.Projection("EPSG:900913"); 
    this.WGS84 = new OpenLayers.Projection("EPSG:4326");
    this.centerPosition = new OpenLayers.LonLat(-75.3, 45.6);
    
    // define background layer
    var osm = new OpenLayers.Layer.OSM( "Open Street Map");
    this.map.addLayers([osm]); 
    
    // define center position and zoom level
    this.map.setCenter(this.centerPosition.transform(this.WGS84, this.mercator), 7);
};

// Function Name: previewGraphic
// Description: show preview graphic point
graphicEditor.previewGraphic = function() {
    var pointLayer = new OpenLayers.Layer.Vector("Point layer");
    this.map.addLayer(pointLayer); 
    
    // create and add point to tempPointLayer
    var point = new OpenLayers.Geometry.Point(-75.6, 45.3);
    point.transform(this.WGS84, this.mercator);
    var pointFeature = new OpenLayers.Feature.Vector(point, null);                    
    pointLayer.addFeatures([pointFeature]);  
};

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
    // Initiate OpenLayers 3 preview map
    this.initPreviewMap();
    // Set text area
    this.updateTextarea();
};

// Start editor
graphicEditor.start();