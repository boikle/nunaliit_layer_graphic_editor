var graphicEditor = graphicEditor || {
    
    
    
};

// Function Name: generateGrid
// Description: Produces a 10x10 grid consisting of 20x20 div cells
graphicEditor.generateGrid = function() {
    var numColumns = 10;
    var numRows = 10;
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
    //Generate x and y axis labels
    $('#grid').append('<div class="col" id="yaxis"></div');
    for (var i = 0; i <= 9; i++) {
        $('#yaxis').append('<div class="labelcell">' + i + '</div>');
        $('#col_' + i).append('<div class="labelcell">' + i + '</div>');
    };
};

// Function Name: selectCell
// Description: Performs required tasks when a cell is selected. 
graphicEditor.selectCell = function() {


};

// Function Name: unselectCell
// Description: Performs required task when a cell is unselected
graphicEditor.unselectCell = function() {
    
    
};

graphicEditor.start = function() {
   //Create div grid    
   this.generateGrid();
   //Add grid axis labels
   this.generateAxisLabels();
    
};

//Start editor
graphicEditor.start();