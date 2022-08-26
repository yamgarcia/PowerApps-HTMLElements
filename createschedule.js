var Schedule = window.Schedule || {};

(function () {
  this.onWorkdayCreate = function () {
    var Xrm = window.parent.Xrm;
    var accountId = Xrm.Page.data.entity
      .getId()
      .replace("{", "")
      .replace("}", "");

    //Sunday = 1, Monday = 2, Tuesday = 3, Wednesday = 4, Thursday = 5, Friday = 6, Saturday = 7

    const openhour = document.querySelector("#openhour");
    const closehour = document.querySelector("#closehour");

    var data = {
      crf93_weekday: document.getElementById("weekday").value,
      crf93_openinghour: openhour.value,
      crf93_closinghour: closehour.value,
      "trr_Business@odata.bind": "/accounts(" + accountId + ")",
    };

    Xrm.WebApi.createRecord("crf93_schedule", data).then(
      function success(result) {
        console.log("Schedule created with contactid: " + result.id);
      },
      function (error) {
        console.log(error.message);
      }
    );
  };

  //! Closed Button
  this.onUpdateClosed = function () {
    var Xrm = window.parent.Xrm;
    var accountId = Xrm.Page.data.entity
      .getId()
      .replace("{", "")
      .replace("}", "");

    let chosenWeekdayToUpdate = document.querySelector("#weekday").value;
    var data = {
      crf93_weekday: chosenWeekdayToUpdate,
      crf93_openinghour: "Closed",
      crf93_closinghour: "Closed",
      "trr_Business@odata.bind": "/accounts(" + accountId + ")",
    };

    let weekdayIdToUpdate;

    Xrm.WebApi.retrieveMultipleRecords(
      "account",
      `?$select=name&$filter=accountid eq ${accountId}&$expand=trr_crf93_schedule_Business_account($select=crf93_weekday,crf93_openinghour,crf93_closinghour)`
    )
      .then(
        function success(result) {
          //* Find the id of the schedule that needs update
          (weekdayIdToUpdate =
            result.entities[0].trr_crf93_schedule_Business_account.filter(
              (schedule) => {
                if (schedule.crf93_weekday == parseInt(chosenWeekdayToUpdate)) {
                  return schedule.crf93_scheduleid;
                }
              }
            )),
            Xrm.WebApi.updateRecord(
              "crf93_schedule",
              weekdayIdToUpdate[0].crf93_scheduleid,
              data
            ).then(
              function success(result) {
                console.log(
                  `The weekday of number ${chosenWeekdayToUpdate} has been set to closed`
                );
              },
              function (error) {
                console.log(error.message);
              }
            );
        },
        function (error) {
          console.log(error.message);
        }
      )
      .catch(function (error) {
        console.log(error.message);
        console.log(
          `The weekday of number ${chosenWeekdayToUpdate} is likely not found. Therefore it can't be updated`
        );
      });
  };

  /**
   * Creates one schedule instance for each weekday (7) with default values upon deletion of
   * every schedule instance related to the current account
   */
  this.onScheduleCreate = function () {
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    var Xrm = window.parent.Xrm;
    var accountId = Xrm.Page.data.entity
      .getId()
      .replace("{", "")
      .replace("}", "");

    //Dataverse hint:
    //Sunday = 1, Monday = 2, Tuesday = 3, Wednesday = 4, Thursday = 5, Friday = 6, Saturday = 7

    Xrm.WebApi.retrieveMultipleRecords(
      "account",
      `?$select=name&$filter=accountid eq ${accountId}&$expand=trr_crf93_schedule_Business_account($select=crf93_weekday,crf93_openinghour,crf93_closinghour)`
    )
      .then(
        async function success(result) {
          if (result.entities[0].trr_crf93_schedule_Business_account[0]) {
            let scheduleIdArray = [];
            //* iterate and push each id into scheduleIdArray as reference for deletion
            await result.entities[0].trr_crf93_schedule_Business_account.forEach(
              (schedule) => {
                scheduleIdArray = [
                  ...scheduleIdArray,
                  schedule.crf93_scheduleid,
                ];
              }
            );

            //* iterate through ids and delete current schedules
            scheduleIdArray.forEach((id) => {
              Xrm.WebApi.deleteRecord("crf93_schedule", id).then(
                function success(result) {
                  console.log(`Schedule of id: ${id} has been deleted`);
                },
                function (error) {
                  console.log(error.message);
                }
              );
            });
          }
        },
        function (error) {
          console.log(error.message);
        }
      )
      .then(
        async function success(result) {
          //* Create new records with default values
          for (let i = 1; i < 8; i++) {
            var data = {
              crf93_weekday: i,
              crf93_openinghour: "09:00",
              crf93_closinghour: "17:00",
              "trr_Business@odata.bind": "/accounts(" + accountId + ")",
            };
            await Xrm.WebApi.createRecord("crf93_schedule", data).then(
              function success(result) {
                console.log(
                  `Workday number ${i}. Schedule created for Account:  ${result.id}`
                );
              },
              function (error) {
                console.log(error.message);
              }
            );
          }
        },
        function (error) {
          console.log(error.message);
        }
      )
      .then(() => {
        sleep(1000);
        Xrm.Page.ui.controls.get("grid_schedule").refresh();
        console.log("Grid refreshed");
      });
  };
}.call(Schedule));
