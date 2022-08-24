var Schedule = window.Contact || {};

(function () {
  this.onScheduleCreate = function () {
    alert("Hello world! This function is on CreateContact.js");
    debugger;
    var Xrm = window.parent.Xrm;
    // formContext.ui.setFormNotification("You clicked on custom button", "INFO", "myButtonId");

    var accountId = Xrm.Page.data.entity
      .getId()
      .replace("{", "")
      .replace("}", "");

    //Dataverse hint:
    //Sunday = 1, Monday = 2, Tuesday = 3, Wednesday = 4, Thursday = 5, Friday = 6, Saturday = 7

    for (let i = 1; i < 8; i++) {
      var data = {
        crf93_weekday: i,
        crf93_openinghour: "09:00 am",
        crf93_closinghour: "05:00 pm",
        "parentcustomerid_account@odata.bind": "/accounts(" + accountId + ")",
      };

      Xrm.WebApi.createRecord("contact", data).then(
        function success(result) {
          console.log(
            `Workday number ${i}. Schedule created with contactid:  ${result.id}`
          );
        },
        function (error) {
          console.log(error.message);
          // handle error conditions
        }
      );
    }
  };

  this.onWorkdayCreate = function () {
    alert("Hello world! This function is on CreateContact.js");
    debugger;
    var Xrm = window.parent.Xrm;
    // formContext.ui.setFormNotification("You clicked on custom button", "INFO", "myButtonId");

    var accountId = Xrm.Page.data.entity
      .getId()
      .replace("{", "")
      .replace("}", "");

    //Sunday = 1, Monday = 2, Tuesday = 3, Wednesday = 4, Thursday = 5, Friday = 6, Saturday = 7

    const openhour = document.querySelector(".openhour");
    const closehour = document.querySelector(".closehour");

    var data = {
      crf93_weekday: document.getElementById("weekday").value,
      crf93_openinghour: openhour.value,
      crf93_closinghour: closehour.value,
      "parentcustomerid_account@odata.bind": "/accounts(" + accountId + ")",
    };

    Xrm.WebApi.createRecord("contact", data).then(
      function success(result) {
        console.log("Contact created with contactid: " + result.id);
      },
      function (error) {
        console.log(error.message);
        // handle error conditions
      }
    );
  };
}.call(Contact));