var socket = io.connect(baseUrl);
socket.on("sparkPattern", (data) => {
  window.spark = data[0].meta;
  displaySparkInfo();
});

function displaySparkInfo() {
  let sparkTable = document.getElementById("sparkTable");
  let plate = ["t", "b", "i", "o"];

  for (var iRow = 0, len = sparkTable.rows.length; iRow < len; iRow++) {
    let qName = "q" + (iRow + 1).toString();
    let row = sparkTable.rows[iRow];

    let cellId = 1;
    for (var iP = 0, len = plate.length; iP < len; iP++) {
      let sparkNum = parseInt(window.spark[qName].s[plate[iP]]);
      row.cells[cellId + iP].innerHTML = plate[iP].toUpperCase() + ": " + sparkNum.toString();
      if (sparkNum > 0) {
        row.cells[cellId + iP].classList.remove("table-success");
        row.cells[cellId + iP].classList.add("table-warning");
      }
      else{
        row.cells[cellId + iP].classList.remove("table-warning");
        row.cells[cellId + iP].classList.add("table-success");
      }
    }

    cellId = 6;
    for (var iP = 0, len = plate.length; iP < len; iP++) {
      let sparkNum = parseInt(window.spark[qName].l[plate[iP]]);
      row.cells[cellId + iP].innerHTML = plate[iP].toUpperCase() + ": " + sparkNum.toString();
      if (sparkNum > 0) {
        row.cells[cellId + iP].classList.remove("table-success");
        row.cells[cellId + iP].classList.add("table-warning");
      }
      else{
        row.cells[cellId + iP].classList.remove("table-warning");
        row.cells[cellId + iP].classList.add("table-success");
      }
    }
  }
};

function readSparkThreshold() {
  $.get(baseUrl + "/camacThreshold").done((data) =>{
    if (!data.error) {
      try {
        let thr = data[0].meta;

        Object.keys(thr).forEach(slot =>{
          entry = "#slot" + slot.toString() + "Th";
          $(entry).text(thr[slot] + " mV");

          if (thr[slot] >= 800) 
            $(entry).css({"color": $(".btn-success").css("background-color")});
          else
            $(entry).css({"color": $(".btn-danger").css("background-color")});
        });
      } catch (e) {
        console.error(e);
        $("#slot3Th").text(`ERROR!`);
        $("#slot3Th").css({"color": $(".btn-danger").css("background-color")});
        $("#slot6Th").text(`ERROR!`);
        $("#slot6Th").css({"color": $(".btn-danger").css("background-color")});
      }
    } else {
      $("#slot3Th").text(`ERROR!`);
      $("#slot3Th").css({"color": $(".btn-danger").css("background-color")});
      $("#slot6Th").text(`ERROR!`);
      $("#slot6Th").css({"color": $(".btn-danger").css("background-color")});
    }
  })
};

function handleSparkEvent(msg) {
  changePulseMode("Stop");
  // reseting the spark bit is done automatically in dataLogger
  playAlarmSound(window.sparkAlarmAudio);
  alert(msg);
}

function showLastSpark() {
  $.get(baseUrl + "/lastSpark")
    .done((data)=>{
      timestamp = new Date(data.timestamp);
      timestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

      sparkedQuads = [];
      quadType = ["l", "s"];

      pattern = data.meta;

      for (var i = 0, len = 4; i < len; i++) {
        quadStr = "q" + (i + 1).toString();

        for (var j = 0; j < 2; j++) {
          nSparks = sumSpark(pattern[quadStr][quadType[j]]);
          if (nSparks > 0) {
            sparkedQuads.push((quadStr + quadType[j]).toUpperCase());
          }
        }
      }

      $("#lastSpark").text("Last: " + timestamp);
      $("#sparkedQuads").text("on: " + sparkedQuads);
    })
    .fail(()=>{
      $("#lastSpark").text("Last: None");
    })
}

function sumSpark(obj){
  var sum = 0;
  for( var el in obj ){
    if( obj.hasOwnProperty(el)){
      sum += obj[el]; 
    }
  }
  return sum;
}

function playAlarmSound(audio, period=20) {
  audio.loop = true;
  setTimeout(()=>{audio.loop = false}, period * 1000);
  audio.play();
}

function clearSparkDisplay() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'POST',
      url: baseUrl + '/clearSparkDisplay',
      success: (res) =>{
        resolve(true);
        displaySparkInfo();
      },
      error: (err, stat) =>{
        resolve(false);
        alert("Failed to clear spark display: " + err.responseText);
      } });
  });
};

function showSparkHistory() {
  $.get(baseUrl + "/sparkHistory")
    .done((data)=>{
      var dt = dynamicTable.config('sparkHistoryTable', 
        ['f1', 'f2', 'f3'], // fields 1-3
        ["Timestamp", "Spark pattern", "Spark bit"], //set to null for field names instead of custom header names
        'There are no items to list...');
      var sparkData = [];
      for (var i = 0, len = data.length; i < len; i++) {
        timestamp = new Date(data[i].timestamp);
        timestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

        patternStr = "";
        sparkedQuads = [];
        quadType = ["l", "s"];

        pattern = data[i].meta;

        for (var k = 0, len = 4; k < len; k++) {
          quadStr = "q" + (k + 1).toString();

          for (var j = 0; j < 2; j++) {
            nSparks = sumSpark(pattern[quadStr][quadType[j]]);
            if (nSparks > 0) {
              patternStr += (quadStr + quadType[j]).toUpperCase() + ": ";
              patternStr += JSON.stringify(pattern[quadStr][quadType[j]]) + "\n";
            }
          }
        }

        sparkBit = data[i].meta.sparkBit;

        sparkData.push({f1: timestamp, f2: patternStr, f3: sparkBit});
      }
      dt.load(sparkData);

    })
    .fail(()=>{
      alert("Cannot get spark history ...");
    })
  
}

var dynamicTable = (function() {
  var _tableId, _table, 
    _fields, _headers, 
    _defaultText;

  /** Builds the row with columns from the specified names. 
   *  If the item parameter is specified, the memebers of the names array will be used as property names of the item; otherwise they will be directly parsed as text.
   */
  function _buildRowColumns(names, item) {
    var row = '<tr>';
    if (names && names.length > 0)
    {
      $.each(names, function(index, name) {
        var c = item ? item[name+''] : name;
        row += '<td>' + c + '</td>';
      });
    }
    row += '</tr>';
    return row;
  }

  /** Builds and sets the headers of the table. */
  function _setHeaders() {
    // if no headers specified, we will use the fields as headers.
    _headers = (_headers == null || _headers.length < 1) ? _fields : _headers; 
    var h = _buildRowColumns(_headers);
    if (_table.children('thead').length < 1) _table.prepend('<thead></thead>');
    _table.children('thead').html(h);
  }

  function _setNoItemsInfo() {
    if (_table.length < 1) return; //not configured.
    var colspan = _headers != null && _headers.length > 0 ? 
      'colspan="' + _headers.length + '"' : '';
    var content = '<tr class="no-items"><td ' + colspan + ' style="text-align:center">' + 
      _defaultText + '</td></tr>';
    if (_table.children('tbody').length > 0)
      _table.children('tbody').html(content);
    else _table.append('<tbody>' + content + '</tbody>');
  }

  function _removeNoItemsInfo() {
    var c = _table.children('tbody').children('tr');
    if (c.length == 1 && c.hasClass('no-items')) _table.children('tbody').empty();
  }

  return {
    /** Configres the dynamic table. */
    config: function(tableId, fields, headers, defaultText) {
      _tableId = tableId;
      _table = $('#' + tableId);
      _fields = fields || null;
      _headers = headers || null;
      _defaultText = defaultText || 'No items to list...';
      _setHeaders();
      _setNoItemsInfo();
      return this;
    },
    /** Loads the specified data to the table body. */
    load: function(data, append) {
      if (_table.length < 1) return; //not configured.
      _setHeaders();
      _removeNoItemsInfo();
      if (data && data.length > 0) {
        var rows = '';
        $.each(data, function(index, item) {
          rows += _buildRowColumns(_fields, item);
        });
        var mthd = append ? 'append' : 'html';
        _table.children('tbody')[mthd](rows);
      }
      else {
        _setNoItemsInfo();
      }
      return this;
    },
    /** Clears the table body. */
    clear: function() {
      _setNoItemsInfo();
      return this;
    }
  };
}());
