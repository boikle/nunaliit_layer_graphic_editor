var graphicEditor = graphicEditor || {
    gridModel: [],
    numColumns: 10,
    numRows: 10,
    userClickSummary: ""
};

// Function Name: cell
// Description: constructor for creating cell objects
function cell(id) {
    this.clickStatus = false;
    this.mouseOverStatus = false;
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

// Function Name: initiateGridModel
// Description: Initiate grid model with unselected cell values
graphicEditor.initiateGridModel = function() {
  var gridModel = this.gridModel;
  var numColumns = this.numColumns;
  var numRows = this.numRows;  
  for (var i = 0; i < numRows; i ++) {
      for(var j = 0; j < numColumns; j ++) {
          var cellID = i + "_" + j;
          var cellModel = new cell(cellID);
          gridModel.push(cellModel);  
      };      
   };
};

// Function Name: generateAxisLabels
// Description: Creates x and y axis grid labels Note: axis origin is top right corner
graphicEditor.generateAxisLabels = function() {
    //Generate x and y axis labels
    $('#grid').append('<div class="col" id="yaxis"></div');
    for (var i = 0; i <= 9; i++) {
        $('#yaxis').append('<div class="labelcell">' + i + '</div>');
        $('#col_' + i).append('<div class="labelcell">' + i + '</div>');
    };
};


graphicEditor.gridEventListener = function() {
    //Handler for hovering over grid cells
    this.selectCell();
    
    //Handler for hovering over grid cells
    this.mouseoverCell();  
};

// Function Name: selectCell
// Description: Performs required tasks when a cell is selected. 
graphicEditor.selectCell = function() {
    $('.gridcell').click( function() { 
        window.console.log("mouse click event");
    });  

};

// Function Name: unselectCell
// Description: Performs required tasks when a cell is unselected
graphicEditor.unselectCell = function() {
      
};

// Function Name: mouseoverCell
// Description: Performs required tasks when a cell is mouseover
graphicEditor.mouseoverCell = function() {
    $('.gridcell').mouseover( function() { 
        window.console.log("mouse over event");
    });    
};


// Function name: start
// Description: calls required functions to start graphic editor. 
graphicEditor.start = function() {
    //Create div grid  
    this.generateGrid();
    //Add grid axis labels
    this.generateAxisLabels();
    //Initiate Grid data model
    this.initiateGridModel();
    //Grid Event listener
    this.gridEventListener();
};

//Start editor
graphicEditor.start();