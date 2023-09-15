/*
   Copyright 2023 Betim Beja and Shko Online LLC

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import type { IInputs, IOutputs } from "./generated/ManifestTypes";

import "./banner";

const BUTTONS_CLASS = "ShkoOnline.Buttons";
const DOWNLOAD_CLASS = "ShkoOnline.Download";
const NO_RECORD_CLASS = "ShkoOnline.NoRecord";
const NO_RECORD_ICON_CLASS = "ShkoOnline.NoRecordIcon";
const DURATION_CLASS = "ShkoOnline.Duration";
const FORWARD_CLASS = "ShkoOnline.Forward";
const HIDDEN_CLASS = "ShkoOnline.Hidden";
const INFOS_CLASS = "ShkoOnline.Infos";
const LOAD_CLASS = "ShkoOnline.Load";
const LOADED_CLASS = "ShkoOnline.Loaded";
const NO_SOUND_CLASS = "ShkoOnline.NoSound";
const NO_RECORDING_CLASS = "ShkoOnline.NoRecording";
const PAUSE_CLASS = "ShkoOnline.Pause";
const PLAY_CLASS = "ShkoOnline.Play";
const PLAYER_CLASS = "ShkoOnline.Player";
const PROGRESS_CLASS = "ShkoOnline.Progress";
const PROGRESS_BAR_CLASS = "ShkoOnline.ProgressBar";
const REWIND_CLASS = "ShkoOnline.Rewind";
const SOUND_CLASS = "ShkoOnline.Sound";
const TIMER_CLASS = "ShkoOnline.Timer";
const TITLE_CLASS = "ShkoOnline.Title";
const UNLOADED_CLASS = "ShkoOnline.Unloaded";

export class AudioPlayer
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  /**
   * Empty constructor.
   */
  constructor() { }

  private audio: HTMLAudioElement;
  private audioSource: HTMLSourceElement;
  private duration: HTMLDivElement;
  private playerContainer: HTMLDivElement;
  private progressBar: HTMLDivElement;
  private timer: HTMLDivElement;
  private togglePlayButton: HTMLDivElement;
  private toggleMuteButton: HTMLDivElement;


  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    // Add control initialization code
    this.playerContainer = document.createElement("div");
    this.playerContainer.className = PLAYER_CLASS;
    if (!context.mode.isVisible) {
      this.playerContainer.classList.add(HIDDEN_CLASS);
    }

    this.audio = document.createElement("audio");
    this.audioSource = document.createElement("source");
    this.audio.preload = "none";
    this.audioSource.setAttribute("type", "audio/mpeg");
    this.audioSource.setAttribute("src", context.parameters.src.raw?.trim() || "");
    this.audio.appendChild(this.audioSource);
    this.audio.append("Your browser does not support the audio element!");
    this.audio.onloadedmetadata = this.metadataLoaded.bind(this);
    this.audio.ontimeupdate = this.onTimeUpdate.bind(this);

    this.playerContainer.appendChild(this.audio);

    const infos = document.createElement("div");
    infos.className = INFOS_CLASS;

    this.timer = document.createElement("div");
    this.timer.className = TIMER_CLASS;
    this.timer.innerHTML = "00:00";

    infos.appendChild(this.timer);

    const title = document.createElement("div");
    title.className = TITLE_CLASS;
    title.innerText = "Audio Player";

    infos.appendChild(title);

    this.duration = document.createElement("div");
    this.duration.className = DURATION_CLASS;
    this.duration.innerText = "00:00";

    infos.appendChild(this.duration);

    this.playerContainer.appendChild(infos);

    const progress = document.createElement("div");
    progress.className = PROGRESS_CLASS;
    progress.onclick = this.seek.bind(this);

    this.progressBar = document.createElement("div");
    this.progressBar.className = PROGRESS_BAR_CLASS;

    progress.appendChild(this.progressBar);

    this.playerContainer.appendChild(progress);

    const load = document.createElement("div");
    load.className = LOAD_CLASS;

    const loadButton = document.createElement("div");
    loadButton.className = DOWNLOAD_CLASS;
    loadButton.onclick = this.download.bind(this);
    load.appendChild(loadButton);

    this.playerContainer.appendChild(load);

    const noRecord = document.createElement("div");
    noRecord.className = NO_RECORD_CLASS;

    const noRecord_button = document.createElement("div");
    noRecord_button.className = NO_RECORD_CLASS;

    noRecord.appendChild(noRecord_button);

    this.playerContainer.appendChild(noRecord);

    const buttons = document.createElement("div");
    buttons.className = BUTTONS_CLASS;

    const rewindButton = document.createElement("div");
    rewindButton.className = REWIND_CLASS;
    rewindButton.onclick = this.rewind.bind(this);
    buttons.appendChild(rewindButton);

    this.togglePlayButton = document.createElement("div");
    this.togglePlayButton.className = PLAY_CLASS;
    this.togglePlayButton.onclick = this.togglePlay.bind(this);
    buttons.appendChild(this.togglePlayButton);

    const forwardButton = document.createElement("div");
    forwardButton.className = FORWARD_CLASS;
    forwardButton.onclick = this.forward.bind(this);
    buttons.appendChild(forwardButton);

    this.toggleMuteButton = document.createElement("div");
    this.toggleMuteButton.className = SOUND_CLASS;
    this.toggleMuteButton.onclick = this.toggleMute.bind(this);
    buttons.appendChild(this.toggleMuteButton);

    this.playerContainer.appendChild(buttons);

    container.appendChild(this.playerContainer);

    if (this.audioSource.getAttribute("src") != null && this.audioSource.getAttribute("src") != "") {
      console.log(this.audioSource.getAttribute("src") );
      this.playerContainer.classList.add(UNLOADED_CLASS);
    } else {
      this.playerContainer.classList.add(NO_RECORDING_CLASS);
    }

  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    if (
      context.mode.isVisible &&
      this.playerContainer.classList.contains(HIDDEN_CLASS)
    ) {
      this.playerContainer.classList.remove(HIDDEN_CLASS);
    } else if (
      !context.mode.isVisible &&
      !this.playerContainer.classList.contains(HIDDEN_CLASS)
    ) {
      this.playerContainer.classList.add(HIDDEN_CLASS);
    }

    if (this.audioSource.getAttribute("src") !== context.parameters.src.raw?.trim()) {
      if ((context.parameters.src.raw?.trim() || "") !== "") {
        if (!this.playerContainer.classList.contains(UNLOADED_CLASS))
          this.playerContainer.classList.add(UNLOADED_CLASS);
        if (this.playerContainer.classList.contains(LOADED_CLASS))
          this.playerContainer.classList.remove(LOADED_CLASS);
        if (this.playerContainer.classList.contains(NO_RECORDING_CLASS))
          this.playerContainer.classList.remove(NO_RECORDING_CLASS);

      } else {
        this.playerContainer.classList.remove(UNLOADED_CLASS);
        this.playerContainer.classList.remove(LOADED_CLASS);
        this.playerContainer.classList.add(NO_RECORDING_CLASS);
      }

      this.audioSource.setAttribute("src", context.parameters.src.raw?.trim() || "");
    }
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return {};
  }

  private metadataLoaded() {
    this.duration.innerHTML = AudioPlayer.getMinutes(this.audio.duration);
  }

  private download() {

    this.playerContainer.classList.remove(UNLOADED_CLASS);
    this.playerContainer.classList.add(LOADED_CLASS);
    this.audio.load();
  }

  private forward() {
    if (this.audio.error) return;
    this.audio.currentTime = this.audio.currentTime + 5;
    this.setBarProgress();
  }

  private static getMinutes(time: number) {
    const min = Math.floor(time / 60);
    const sec = (time | 0) % 60;
    return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
  }

  private onTimeUpdate() {
    var t = this.audio.currentTime;
    this.timer.innerHTML = AudioPlayer.getMinutes(t);
    this.setBarProgress();
    if (this.audio.ended) {
      this.togglePlayButton.className = PLAY_CLASS;
    }
  }

  private togglePlay() {
    if (this.audio.error) return;
    if (this.audio.paused) {
      this.togglePlayButton.className = PAUSE_CLASS;
      this.audio.play();
    } else {
      this.togglePlayButton.className = PLAY_CLASS;
      this.audio.pause();
    }
  }
  private toggleMute() {
    if (this.audio.error) return;
    if (this.audio.muted == false) {
      this.audio.muted = true;
      this.toggleMuteButton.className = NO_SOUND_CLASS;
    } else {
      this.audio.muted = false;
      this.toggleMuteButton.className = SOUND_CLASS;
    }
  }

  private rewind() {
    if (this.audio.error) return;
    this.audio.currentTime = this.audio.currentTime - 5;
    this.setBarProgress();
  }

  private seek(event: MouseEvent) {
    if (this.audio.error) return;
    var percent =
      event.offsetX / (this.progressBar.parentElement?.offsetWidth || Infinity);
    this.audio.currentTime = percent * this.audio.duration;
    this.progressBar.style.width = percent * 100 + "%";
  }

  private setBarProgress() {
    if (this.audio.error) return;
    var progress = (this.audio.currentTime / this.audio.duration) * 100;
    this.progressBar.style.width = progress + "%";
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
  }
}
