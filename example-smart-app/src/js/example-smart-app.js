// example-smart-app.js

const defaultQuestionnaire = {
  "resourceType": "Questionnaire",
  "id": "311M",
  "meta": {
      "versionId": "4",
      "lastUpdated": "2024-05-10T15:35:59.356+00:00",
      "source": "#6kpooEBakwv4dTIe",
      "profile": [
          "http://hl7.org/fhir/4.0/StructureDefinition/Questionnaire"
      ],
      "tag": [
          { "code": "lformsVersion: 29.0.0" },
          { "code": "lformsVersion: 34.0.2" },
          { "code": "lformsVersion: 34.3.1" }
      ]
  },
  "title": "Columbia - suicide severity rating scale screener - recent [C-SSRS]",
  "status": "draft",
  "copyright": "© 2011 Dr. Kelly Posner, first author of the scale. Used with permission",
  "code": [
      {
          "system": "http://loinc.org",
          "code": "93373-9",
          "display": "Columbia - suicide severity rating scale screener - recent [C-SSRS]"
      }
  ],
  "item": [
      {
          "linkId": "/93246-7",
          "text": "Have you wished you were dead or wished you could go to sleep and not wake up?",
          "type": "choice",
          "answerOption": [
              { "valueCoding": { "code": "LA33-6", "display": "Yes" } },
              { "valueCoding": { "code": "LA32-8", "display": "No" } }
          ]
      },
      {
          "linkId": "/93247-5",
          "text": "Have you actually had any thoughts of killing yourself?",
          "type": "choice",
          "answerOption": [
              { "valueCoding": { "code": "LA33-6", "display": "Yes" } },
              { "valueCoding": { "code": "LA32-8", "display": "No" } }
          ]
      },
      {
          "linkId": "/93248-3",
          "text": "Have you been thinking about how you might do this?",
          "type": "choice",
          "enableWhen": [
              {
                  "question": "/93247-5",
                  "operator": "=",
                  "answerCoding": { "code": "LA33-6", "display": "Yes" }
              }
          ],
          "answerOption": [
              { "valueCoding": { "code": "LA33-6", "display": "Yes" } },
              { "valueCoding": { "code": "LA32-8", "display": "No" } }
          ]
      },
      {
          "linkId": "/93249-1",
          "text": "Have you had these thoughts and had some intention of acting on them?",
          "type": "choice",
          "enableWhen": [
              {
                  "question": "/93247-5",
                  "operator": "=",
                  "answerCoding": { "code": "LA33-6", "display": "Yes" }
              }
          ],
          "answerOption": [
              { "valueCoding": { "code": "LA33-6", "display": "Yes" } },
              { "valueCoding": { "code": "LA32-8", "display": "No" } }
          ]
      },
      {
          "linkId": "/93250-9",
          "text": "Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?",
          "type": "choice",
          "enableWhen": [
              {
                  "question": "/93247-5",
                  "operator": "=",
                  "answerCoding": { "code": "LA33-6", "display": "Yes" }
              }
          ],
          "answerOption": [
              { "valueCoding": { "code": "LA33-6", "display": "Yes" } },
              { "valueCoding": { "code": "LA32-8", "display": "No" } }
          ]
      },
      {
          "linkId": "/93267-3",
          "text": "Have you ever done anything, started to do anything, or prepared to do anything to end your life?",
          "type": "choice",
          "answerOption": [
              { "valueCoding": { "code": "LA33-6", "display": "Yes" } },
              { "valueCoding": { "code": "LA32-8", "display": "No" } }
          ]
      },
      {
          "linkId": "/93269-9",
          "text": "Was this within the past 3 months?",
          "type": "choice",
          "enableWhen": [
              {
                  "question": "/93267-3",
                  "operator": "=",
                  "answerCoding": { "code": "LA33-6", "display": "Yes" }
              }
          ],
          "answerOption": [
              { "valueCoding": { "code": "LA33-6", "display": "Yes" } },
              { "valueCoding": { "code": "LA32-8", "display": "No" } }
          ]
      }
  ]
};

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
  fetch('https://interop.salessbx.smiledigitalhealth.com/fhir-request/QuestionnaireResponse', {
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
      }).fail(function(patientError, questionnaireError) {
          if (patientError) {
              console.error("Failed to read patient data:", patientError);
          }
          if (questionnaireError) {
              console.error("Failed to read questionnaire data:", questionnaireError);
              createQuestionnaireForm(defaultQuestionnaire);
              document.getElementById("submit-button").onclick = function() {
                  submitQuestionnaire(patient.id, defaultQuestionnaire);
              };
          }
      });
  } else {
      console.error("SMART FHIR client does not have patient context.");
  }
}

FHIR.oauth2.ready(onReady);
