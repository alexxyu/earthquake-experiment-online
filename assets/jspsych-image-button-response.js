/**
 * jspsych-image-button-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["image-button-response"] = (function () {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('image-button-response', 'stimulus', 'image');

    plugin.info = {
        name: 'image-button-response',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.IMAGE,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The image to be displayed'
            },
            stimulus_height: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Image height',
                default: null,
                description: 'Set the image height in pixels'
            },
            stimulus_width: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Image width',
                default: null,
                description: 'Set the image width in pixels'
            },
            maintain_aspect_ratio: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Maintain aspect ratio',
                default: true,
                description: 'Maintain the aspect ratio after setting width or height'
            },
            choices: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Choices',
                default: undefined,
                array: true,
                description: 'The labels for the buttons.'
            },
            button_html: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button HTML',
                default: '<button class="jspsych-btn">%choice%</button>',
                array: true,
                description: 'The html of the button. Can create own style.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed under the button.'
            },
            stimulus_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus duration',
                default: null,
                description: 'How long to hide the stimulus.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to show the trial.'
            },
            margin_vertical: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Margin vertical',
                default: '0px',
                description: 'The vertical margin of the button.'
            },
            margin_horizontal: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Margin horizontal',
                default: '8px',
                description: 'The horizontal margin of the button.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, then trial will end when user responds.'
            },
        }
    }

    plugin.trial = function (display_element, trial) {

        let img_src = trial.stimulus;

        const width = 600;
        const height = 600;

        //image stimulus
        var html = '<div style="clear: both">';
        html += `<div class="quadrant" data-choice="2" style="background-image: url(${img_src}); outline: blue solid 1px; outline-offset: -1px; `;
        html += `width: ${width/2}px; height: ${height/2}px; float: left; background-size: ${width}px ${height}px; background-position: 0px 0px; display: inline-block;"></div>`;
        html += `<div class="quadrant" data-choice="1" style="background-image: url(${img_src}); outline: blue solid 1px; outline-offset: -1px; `;
        html += `width: ${width/2}px; height: ${height/2}px; float: left; background-size: ${width}px ${height}px; background-position: ${-width/2}px 0px; display: inline-block;"></div>`;
        html += '</div>';

        html += '<div style="clear: both">';
        html += `<div class="quadrant" data-choice="3" style="background-image: url(${img_src}); outline: blue solid 1px; outline-offset: -1px; `;
        html += `width: ${width/2}px; height: ${height/2}px; float: left; background-size: ${width}px ${height}px;background-position: 0px ${-height/2}px; display: inline-block;"></div>`;
        html += `<div class="quadrant" data-choice="4" style="background-image: url(${img_src}); outline: blue solid 1px; outline-offset: -1px; `;
        html += `width: ${width/2}px; height: ${height/2}px; float: left; background-size: ${width}px ${height}px;background-position: ${-width/2}px ${-height/2}px; display: inline-block;"></div>`;
        html += '</div>';

        //display buttons
        var buttons = [];
        if (Array.isArray(trial.button_html)) {
            if (trial.button_html.length == trial.choices.length) {
                buttons = trial.button_html;
            } else {
                console.error('Error in image-button-response plugin. The length of the button_html array does not equal the length of the choices array');
            }
        } else {
            for (var i = 0; i < trial.choices.length; i++) {
                buttons.push(trial.button_html);
            }
        }
        html += '<div id="jspsych-image-button-response-btngroup">';

        for (var i = 0; i < trial.choices.length; i++) {
            var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
            html += '<div class="jspsych-image-button-response-button" style="display: inline-block; margin:' + trial.margin_vertical + ' ' + trial.margin_horizontal + '" id="jspsych-image-button-response-button-' + i + '" data-choice="' + i + '">' + str + '</div>';
        }
        html += '</div>';

        //show prompt if there is one
        if (trial.prompt !== null) {
            html += trial.prompt;
        }

        display_element.innerHTML = html;

        // store response
        var response = {
            rt: null,
            quadrants: []
        };

        // start timing
        var start_time = performance.now();

        // add click controls to each quadrant in image stimulus
        for(let quadrant of document.getElementsByClassName("quadrant")) {
            quadrant.addEventListener('click', function (event) {
                if(quadrant.style.outline === "blue solid 1px") {
                    quadrant.style.outline = "red solid 4px";
                    quadrant.style["outline-offset"] = "-4px";

                    let choice = event.currentTarget.getAttribute('data-choice');
                    response.quadrants.push(choice);
                }
                else {
                    quadrant.style.outline = "blue solid 1px";
                    quadrant.style["outline-offset"] = "-1px";

                    let choice = event.currentTarget.getAttribute('data-choice');
                    const index = response.quadrants.indexOf(choice);
                    if (index > -1) {
                        response.quadrants.splice(index, 1);
                    }
                }
            });
        }

        for (var i = 0; i < trial.choices.length; i++) {
            display_element.querySelector('#jspsych-image-button-response-button-' + i).addEventListener('click', function (e) {
                var choice = e.currentTarget.getAttribute('data-choice');
                after_response(choice);
            });
        }

        // function to handle responses by the subject
        function after_response(choice) {
            // measure rt
            var end_time = performance.now();
            var rt = end_time - start_time;
            response.rt = rt;

            if (trial.response_ends_trial) {
                end_trial();
            }
        };

        // function to end trial when it is time
        function end_trial() {

            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            response.quadrants.sort();
            // gather the data to store for the trial
            var trial_data = {
                "rt": response.rt,
                "stimulus": trial.stimulus,
                "quadrants_selected": response.quadrants
            };

            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        };

        // hide image if timing is set
        if (trial.stimulus_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function () {
                display_element.querySelector('#jspsych-image-button-response-stimulus').style.visibility = 'hidden';
            }, trial.stimulus_duration);
        }

        // end trial if time limit is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function () {
                end_trial();
            }, trial.trial_duration);
        }

    };

    return plugin;
})();
