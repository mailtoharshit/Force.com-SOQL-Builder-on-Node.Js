//Hosting Code to Heroku Platform 
var apiVersion = 'v29.0',
    clientId = '3MVG9xOCXq4ID1uHGNaZ5zbKxqGsFbvb802bA8CzRfSDQCD7oSr1_KXm66Sc8k.IJ9UAh0_FuhTUEsEmWwSQE   ',
    loginUrl = 'https://login.salesforce.com/',
    redirectURI = "https://oyecodesoql.herokuapp.com/auth/salesforce/callback",
    proxyURL = 'http://localhost:3000/proxy/',
    client = new forcetk.Client(clientId, loginUrl, proxyURL);

function login() {
    var url = loginUrl + 'services/oauth2/authorize?display=popup&response_type=token' +
        '&client_id=' + encodeURIComponent(clientId) +
        '&redirect_uri=' + encodeURIComponent(redirectURI);
    popupCenter(url, 'login', 700, 600);
}

function loginDialogCallback(response) {
    if (response && response.access_token) {
        client.setSessionToken(response.access_token, apiVersion, response.instance_url);
    
       //change the text color and hide disconnected text
        document.getElementById("connected").style.visibility="visible";
        document.getElementById("Disconnected").style.visibility="hidden";
        document.getElementById("btn-login").removeAttribute("class");
        document.getElementById("btn-login").setAttribute("class", "btn btn-x");
        document.getElementById("btn-exec").setAttribute("class", "btn btn-primary");
        
    } 

    else {
        alert("AuthenticationError: No Token");
    }
}

function getColumns(records) {
    var i=0, j=0, recProps;
    var props = [];
    for(;i<records.length;i++) {
        recProps = getProps(records[i]);
        for(j=0;j<recProps.length;j++) {
            if(props.indexOf(recProps[j])<0) {
                props.push(recProps[j]);
            }
        }
    }
    
    return props;
}

function getProps(rec){
    var col, val, i=0;
    var props = [];
    for(col in rec) {
        if(col.indexOf("__")==0) continue;
        val = rec[col];
        if(col!="attributes") {
            if(typeof(val)=="object") {
                var innerProps = getProps(val);
                for(i=0;i<innerProps.length;i++) {
                    props.push(col+"."+innerProps[i]);
                }
            }
            else {
                props.push(col);
            }
        }
    }
    return props;
}

function render(records) {
    if(records.length==0) {
        $("#content").empty().append('<div>No records found</div>');
        return;
    }
    
    var queryColumns = getColumns(records);
    var i,displayColumns = [];

    for(i=0;i<queryColumns.length;i++) {
        displayColumns.push({ mData: queryColumns[i] });
    }

    var s = '';
    s+='<div style="color:red;font-size:0.8em;">*Columns containing ONLY NULL values are not rendered</div><hr/>';
    s+='<div><table id= "datatable" class="dataTable" border="0" cellpadding="0" cellspacing="0">'; 
    s+="<thead><tr>";
    for(i=0;i<queryColumns.length;i++) {
        s+="<th>"+queryColumns[i]+"</th>";
    }
    s+="</tr></thead>";
    s+='</table></div>';
    
    $("#content").empty().append(s);

    var oTable = $('#datatable').dataTable( {
        "aaData" : records,
        "aoColumns": displayColumns,
        "sPaginationType": "full_numbers",
        "bLengthChange": true
    } );
    
}

function executeQuery() {
    if (!client.sessionId) {
        alert('You are not authenticated. Please login first.');
        return false;
    }
    client.query($('#query').val(),
        function (data) {
            //$('#result').html(JSON.stringify(data, undefined, 3));
            if(data.records) {
                render(data.records);
            } else {
                render(data);
            }
                    },
        function (error) {
            alert("Error: " + JSON.stringify(error));
        });
    return false;
}

$('#btn-login').click(login);
$('#btn-exec').click(executeQuery);

function popupCenter(url, title, w, h) {
    // Handles dual monitor setups
    var parentLeft = window.screenLeft ? window.screenLeft : window.screenX;
    var parentTop = window.screenTop ? window.screenTop : window.screenY;
    var left = parentLeft + (window.innerWidth / 2) - (w / 2);
    var top = parentTop + (window.innerHeight / 2) - (h / 2);
    return window.open(url, title, 'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}