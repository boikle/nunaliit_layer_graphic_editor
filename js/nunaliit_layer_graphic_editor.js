/*
Copyright (c) 2015, Robert Oikle
All rights reserved.
*/
;
var overlayGraphicEditor = overlayGraphicEditor || (function () {
    "use strict";
    var editorProperties = {
        gridModel: [],
        numColumns: 11,
        numRows: 11,
        userClickSummary: "",
        map: null,
        mercator: null,
        WGS84: null,
        centerPosition: null,
        overlayStyle: null,
        appStyleMap: null,
        pointLayer: null,
        point: null,
        pointFeature: null,
        osm: null,
        lon: -75.69953,
        lat: 45.38076,
        zoomLevel: 10,
        initialize: function () {
            var that = this;
            this.map = new OpenLayers.Map('map');
            this.mercator = new OpenLayers.Projection("EPSG:900913");
            this.WGS84 = new OpenLayers.Projection("EPSG:4326");
            this.centerPosition = new OpenLayers.LonLat(this.lon, this.lat);
            this.osm = new OpenLayers.Layer.OSM("Open Street Map");
            this.overlayStyle = new OpenLayers.Style({
                graphicName: "previewSymbol",
                fillColor: '#0000FF',
                strokeColor: '#000F76',
                strokeOpacity: 1.0,
                fillOpacity: 0.3,
                pointRadius: 12
            });
            this.appStyleMap = new OpenLayers.StyleMap({
                default: this.overlayStyle
            });
            this.map.addLayers([that.osm]);
            this.map.setCenter(that.centerPosition.transform(this.WGS84, this.mercator), this.zoomLevel);
        }
    };

    // Constructors //////////////////////////////////////////////////////////////////////////
    /**
     * Constructor for creating cell objects
     * @param {string} id the css id of grid cell
     */
    function Cell(id) {
        this.clickState = false;
        this.cellID = id;
    }

    // Grid editor functions /////////////////////////////////////////////////////////////////
    /**
     * Produces a 11x11 grid consisting of 20x20 px div cells
     */
    var _generateGrid = function () {
        var numColumns, numRows, i, j;
        numColumns = editorProperties.numColumns;
        numRows = editorProperties.numRows;
        for (i = 0; i < numRows; i += 1) {
            $('#grid').append('<div class="col" id="col_' + i + '"></div');
            for (j = 0; j < numColumns; j += 1) {
                $('#col_' + i).append('<div class="gridcell" id="' + i + "_" + j + '"></div>');
            }
        }
    };
    /**
     * Creates the x and y axis grid labels
     * Note: axis origin is top right corner
     */
    var _generateAxisLabels = function () {
        var i;
        $('#grid').append('<div class="col" id="yaxis"></div');
        for (i = 0; i <= (editorProperties.numRows - 1); i += 1) {
            $('#yaxis').append('<div class="labelcell">' + i + '</div>');
            $('#col_' + i).append('<div class="labelcell">' + i + '</div>');
        }
    };
    /**
     * Updates the class of each div cell based on the state in the grid data model
     */
    var _updateGridView = function () {
        var cell;
        for (cell in editorProperties.gridModel) {
            if (editorProperties.gridModel[cell].clickState === true) {
                $('#' + editorProperties.gridModel[cell].cellID).addClass('selectedgridcell');
            } else if (editorProperties.gridModel[cell].clickState === false) {
                $('#' + editorProperties.gridModel[cell].cellID).removeClass('selectedgridcell');
            }
        }
    };
    // Grid Model functions //////////////////////////////////////////////////////////////////
    /**
     * Initiate grid model with unselected cell values
     */
    var _initiateGridModel = function () {
        var gridModel, numColumns, numRows, i, j, cellModel;
        gridModel = editorProperties.gridModel;
        numColumns = editorProperties.numColumns;
        numRows = editorProperties.numRows;
        for (i = 0; i < numRows; i += 1) {
            for (j = 0; j < numColumns; j += 1) {
                cellModel = new Cell(i + "_" + j);
                gridModel.push(cellModel);
            }
        }
    };
    /**
     * Reset grid model by iterating through all grid cells and set click state to false
     */
    var _resetGridModel = function () {
        var cell;
        for (cell in editorProperties.gridModel) {
            editorProperties.gridModel[cell].clickState = false;
        }
    };
    /**
     * Updates cell object properties.
     * @param {Object} updatedCell object containing the details of cell which needs to be updated
     */
    var _updateGridModel = function (updatedCell) {
        var cellID, gridModel, updateGrid, cell;
        cellID = updatedCell.cellID;
        gridModel = editorProperties.gridModel;
        updateGrid = false;
        for (cell in gridModel) {
            // if cell was not previously clicked, the clickState is set to true
            // else if cell was previously clicked, the clickState reverts to false
            if (cellID === gridModel[cell].cellID && gridModel[cell].clickState === false) {
                editorProperties.gridModel[cell].clickState = true;
                updateGrid = true;
            }
        }
        if (updateGrid) {
            _updateGridView();
        }
    };

    // Control interface functions ///////////////////////////////////////////////////////////
    /**
     * Update the click summary string to include the newly clicked coordinate values
     * @param {array} coords the coordinate pair for clicked cell
     */
    var _updateClickSummary = function (coords) {
        var newCoordsPair;
        newCoordsPair = coords[0] + "," + coords[1];
        if (editorProperties.userClickSummary === "") {
            editorProperties.userClickSummary = editorProperties.userClickSummary + newCoordsPair;
        } else {
            editorProperties.userClickSummary = editorProperties.userClickSummary + "," + newCoordsPair;
        }
    };
    /**
     * Updates value of the input form textarea element
     */
    var _updateTextarea = function () {
        $('#clickSummary').val("[" + editorProperties.userClickSummary + "]");
    };
    /**
     * Removes the preview graphic symbol from the map
     */
    var _removePreviewGraphic = function () {
        if (editorProperties.pointFeature !== null) {
            editorProperties.pointLayer.destroyFeatures([editorProperties.pointFeature]);
        }
    };
    /**
     * Resets both the model and view for the user
     */
    var reset = function () {
        // Reset grid model
        _resetGridModel();
        // Reset click summary
        editorProperties.userClickSummary = "";
        _updateTextarea();
        // Update Grid view
        _updateGridView();
        // Remove point layers from map
        _removePreviewGraphic();
        // Reset fill colour
        editorProperties.overlayStyle.defaultStyle.fillColor = '#0000FF';
        $('#fillColourSelector').val('#0000FF');
        // Reset fill opacity
        editorProperties.overlayStyle.defaultStyle.fillOpacity = 0.3;
        $('#fillOpacitySelector').val(0.3);
        // Reset stroke colour
        editorProperties.overlayStyle.defaultStyle.strokeColor = '#000F76';
        $('#strokeColourSelector').val('#000F76');
        // Reset stroke opacity
        editorProperties.overlayStyle.defaultStyle.strokeOpacity = 1;
        $('#strokeOpacitySelector').val(1);
        // Reset point radius
        editorProperties.overlayStyle.defaultStyle.pointRadius = 12;
        $('#pointRadiusSelector').val(12);
    };

    // Preview map functions /////////////////////////////////////////////////////////////////
    /**
     * Preview symbol appearance based on the contents of the click summary
     */
    var preview = function () {
        if ($('#clickSummary').val() !== '[]') {
            //remove any graphic symbols on map prior to adding a new one
            _removePreviewGraphic();
            editorProperties.pointLayer = new OpenLayers.Layer.Vector('Point layer', {
                styleMap: editorProperties.appStyleMap
            });
            editorProperties.map.addLayer(editorProperties.pointLayer);
            //update Graphic symbol
            eval('OpenLayers.Renderer.symbol.previewSymbol =' + $('#clickSummary').val());
            // create and add point to tempPointLayer
            editorProperties.point = new OpenLayers.Geometry.Point(-75.69953, 45.38076);
            editorProperties.point.transform(editorProperties.WGS84, editorProperties.mercator);
            editorProperties.pointFeature = new OpenLayers.Feature.Vector(editorProperties.point, editorProperties);
            editorProperties.pointLayer.addFeatures([editorProperties.pointFeature]);
        }
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
    var _calcSlope = function (x1, y1, x2, y2) {
        var rise, run, slope;
        rise = y2 - y1;
        run = x2 - x1;
        slope = rise / run;
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
    var _calcIntercept = function (x, y, m) {
        var b;
        b = y - (m * x);
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
    var _calcY = function (x, m, b) {
        var y;
        y = Math.round((m * x) + b);
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
    var _calcX = function (y, m, b) {
        var x;
        x = Math.round((y - b) / m);
        return x;
    };
    /**
     * Calculates which cells need to set as being clicked,
     * in order to connect to points together on a grid
     */
    var _connectPoints = function () {
        var i, x1, y1, x2, y2, m, b, clickSummary, currentCell, update, highX, lowX, highY, lowY, y, x;
        eval("clickSummary =" + $('#clickSummary').val());
        if (clickSummary.length >= 4) {
            x1 = clickSummary[clickSummary.length - 4];
            y1 = clickSummary[clickSummary.length - 3];
            x2 = clickSummary[clickSummary.length - 2];
            y2 = clickSummary[clickSummary.length - 1];
            m = _calcSlope(x1, y1, x2, y2);
            b = _calcIntercept(x1, y1, m);
            // update grid model to connect between points
            if (x1 === x2) {
                if (y1 < y2) {
                    for (i = y1; i < y2; i += 1) {
                        currentCell = x1 + "_" + i;
                        update = {
                            cellID: currentCell,
                            clickState: true
                        };
                        _updateGridModel(update);
                    }
                } else {
                    for (i = y2; i < y1; i += 1) {
                        currentCell = x1 + "_" + i;
                        update = {
                            cellID: currentCell,
                            clickState: true
                        };
                        _updateGridModel(update);
                    }
                }
            } else if (y1 === y2) {
                if (x1 < x2) {
                    for (i = x1; i < x2; i += 1) {
                        currentCell = i + "_" + y1;
                        update = {
                            cellID: currentCell,
                            clickState: true
                        };
                        _updateGridModel(update);
                    }
                } else {
                    for (i = x2; i < x1; i += 1) {
                        currentCell = i + "_" + y1;
                        update = {
                            cellID: currentCell,
                            clickState: true
                        };
                        _updateGridModel(update);
                    }
                }
            } else if (x1 !== x2 && y1 !== y2) {
                if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
                    if (x1 > x2) {
                        highX = x1;
                        lowX = x2;
                    } else {
                        highX = x2;
                        lowX = x1;
                    }
                    for (i = lowX + 1; i < highX; i += 1) {
                        y = _calcY(i, m, b);
                        currentCell = i + "_" + y;
                        update = {
                            cellID: currentCell,
                            clickState: true
                        };
                        _updateGridModel(update);
                    }
                } else {
                    if (y1 > y2) {
                        highY = y1;
                        lowY = y2;
                    } else {
                        highY = y2;
                        lowY = y1;
                    }
                    for (i = lowY + 1; i < highY; i += 1) {
                        x = _calcX(i, m, b);
                        currentCell = x + "_" + i;
                        update = {
                            cellID: currentCell,
                            clickState: true
                        };
                        _updateGridModel(update);
                    }
                }
            }
        }
    };

    // Event handling functions //////////////////////////////////////////////////////////////
    /**
     * Determines what cell is being clicked and reports its state
     * as being clicked.
     */
    var _selectCell = function () {
        var cellID, coordPairs, update;
        $('.gridcell').click( function () {
            cellID = $(this).attr('id');
            coordPairs = cellID.split("_");
            update = {
                cellID: cellID,
                clickState: true
            };
            // execute grid model update
            _updateGridModel(update);
            // update clickSummary
            _updateClickSummary(coordPairs);
            // update textArea
            _updateTextarea();
            // set required cells as clicked to connect points
            _connectPoints();
        });
    };
    /**
     * toggles the css mouseovergridcell class when a user
     * moves their mouse off a grid cell.
     */
    var _mouseoutCell = function () {
        var cellID;
        $('.gridcell').mouseout( function () {
            cellID = $(this).attr('id');
            $(this).toggleClass('mouseovergridcell');
        });
    };
    /**
     * toggles the css mouseovergridcell class when a user
     * moves their mouse over a grid cell.
     */
    var _mouseoverCell = function () {
        var cellID;
        $('.gridcell').mouseover( function () {
            cellID = $(this).attr('id');
            $(this).toggleClass('mouseovergridcell');
        });
    };
    /**
     * Update the fill colour of the default map style
     * when the fill colour selector is changed.
     */
    var _fillColourChange = function () {
        $('#fillColourSelector').change(function () {
            editorProperties.overlayStyle.defaultStyle.fillColor = $('#fillColourSelector').val();
            preview();
        });
    };
    /**
     * Update the fill opacity of the default map style
     * when the fill opacity selector is changed.
     */
    var _fillOpacityChange = function () {
        $('#fillOpacitySelector').change(function () {
            editorProperties.overlayStyle.defaultStyle.fillOpacity = $('#fillOpacitySelector').val();
            preview();
        });
    };
    /**
     * Update the stroke colour of the default map style
     * when the stroke colour selector is changed.
     */
    var _strokeColourChange = function () {
        $('#strokeColourSelector').change(function () {
            editorProperties.overlayStyle.defaultStyle.strokeColor = $('#strokeColourSelector').val();
            preview();
        });
    };
    /**
     * Update the stroke opacity of the default map style when the
     * stroke opacity selector is changed.
     */
    var _strokeOpacityChange = function () {
        $('#strokeOpacitySelector').change(function () {
            editorProperties.overlayStyle.defaultStyle.strokeOpacity = $('#strokeOpacitySelector').val();
            preview();
        });
    };
    /**
     * Update the point radius of the default map style when the
     * point radius selector is changed.
     */
    var _symbolSizeChange = function () {
        $('#pointRadiusSelector').change(function () {
            editorProperties.overlayStyle.defaultStyle.pointRadius = $('#pointRadiusSelector').val();
            preview();
        });
    };
    /**
     * Initiates a number of functions used for event listing
     */
    var _gridEventListener = function () {
        _selectCell();
        _mouseoutCell();
        _mouseoverCell();
        _fillColourChange();
        _fillOpacityChange();
        _strokeColourChange();
        _strokeOpacityChange();
        _symbolSizeChange();
    };

    // Start graphic editor //////////////////////////////////////////////////////////////////
    /**
     * Calls required functions to start graphic editor.
     */
    var start = function () {
        editorProperties.initialize();
        _generateGrid();
        _generateAxisLabels();
        _initiateGridModel();
        _gridEventListener();
        _updateTextarea();
    };
    return {
        start: start,
        preview: preview,
        reset: reset
    };
})();

overlayGraphicEditor.start();