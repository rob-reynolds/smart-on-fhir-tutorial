// example-smart-app.js

function createQuestionnaireForm(questionnaire) {
  console.log("Creating form...");
  const form = document.getElementById("questionnaire-form");

  questionnaire.item.forEach(item => {
      const questionDiv = document.createElement("div");
      questionDiv.className = "question-item";

      const questionLabel = document.createElement("label");
      questionLabel.htmlFor = item.linkId;
      questionLabel.textContent = item.text;
      questionDiv.appendChild(questionLabel);

      const select = document.createElement("select");
      select.id = item.linkId;
      select.name = item.linkId;
      item.answerOption.forEach(option => {
          const opt = document.createElement("option");
          opt.value = option.valueCoding.code;
          opt.textContent = option.valueCoding.display;
          select.appendChild(opt);
      });

      questionDiv.appendChild(select);
      form.appendChild(questionDiv);
  });

  console.log("Questionnaire form created");
  document.getElementById("loading").style.display = "none";
  console.log("Form HTML:", form.innerHTML); // Debugging log to inspect form HTML
}

function submitQuestionnaire(patientId, questionnaire) {
  console.log("Submitting form...");
  const form = document.getElementById("questionnaire-form");
  const formData = new FormData(form);

  let questionnaireResponse = {
      resourceType: "QuestionnaireResponse",
      id: "312M-r",
      basedOn: [
          {
              reference: "ServiceRequest/312M"
          }
      ],
      subject: {
          reference: `Patient/${patientId}`
      },
      encounter: {
          reference: "Encounter/304M"
      },
      questionnaire: `Questionnaire/${questionnaire.id}`,
      status: "completed",
      item: []
  };

  formData.forEach((value, key) => {
      questionnaireResponse.item.push({
          linkId: key,
          answer: [{
              valueCoding: {
                  code: value
              }
          }]
      });
  });

  console.log("Questionnaire Response:", questionnaireResponse);

  // Submit the QuestionnaireResponse to the FHIR endpoint
  fetch('https://interop.salessbx.smiledigitalhealth.com/fhir-request/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/fhir+json'
      },
      body: JSON.stringify(questionnaireResponse)
  })
  .then(response => {
      const feedbackDiv = document.getElementById('feedback');
      if (response.ok) {
          feedbackDiv.textContent = 'QuestionnaireResponse successfully submitted';
          feedbackDiv.style.color = 'green';
          console.log('QuestionnaireResponse successfully submitted');
      } else {
          feedbackDiv.textContent = `Failed to submit QuestionnaireResponse: ${response.statusText}`;
          feedbackDiv.style.color = 'red';
          console.error('Failed to submit QuestionnaireResponse:', response.statusText);
      }
  })
  .catch(error => {
      const feedbackDiv = document.getElementById('feedback');
      feedbackDiv.textContent = `Error submitting QuestionnaireResponse: ${error}`;
      feedbackDiv.style.color = 'red';
      console.error('Error submitting QuestionnaireResponse:', error);
  });
}

function onReady(smart) {
  if (smart.hasOwnProperty('patient')) {
      var patient = smart.patient;
      var patientPromise = patient.read();
      var questionnairePromise = smart.api.read({type: 'Questionnaire', id: '311M'});

      $.when(patientPromise, questionnairePromise).done(function(patientData, questionnaireData) {
          var patient = patientData[0];
          var questionnaire = questionnaireData[0];

          console.log("Patient ID:", patient.id);
          console.log("Questionnaire:", questionnaire);

          createQuestionnaireForm(questionnaire);
          document.getElementById("submit-button").onclick = function() {
              submitQuestionnaire(patient.id, questionnaire);
          };
      }).fail(function(error) {
          console.error("Failed to read data:", error);
      });
  } else {
      console.error("SMART FHIR client does not have patient context.");
  }
}

FHIR.oauth2.ready(onReady);
