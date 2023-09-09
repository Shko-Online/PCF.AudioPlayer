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

import './banner';

export class AudioPlayer
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  /**
   * Empty constructor.
   */
  constructor() {}

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
    this.playerContainer.className = context.mode.isVisible ? "ShkoOnline.Player" : "ShkoOnline.Player ShkoOnline.Hidden";

    this.audio = document.createElement("audio");
    this.audioSource = document.createElement("source");
    this.audioSource.setAttribute("type", "audio/mpeg");
    this.audioSource.setAttribute("src", context.parameters.src.raw || "");
    this.audio.appendChild(this.audioSource);
    this.audio.append("Your browser does not support the audio element!");
    this.audio.onloadedmetadata = this.metadataLoaded.bind(this);
    this.audio.ontimeupdate = this.onTimeUpdate.bind(this);

    this.playerContainer.appendChild(this.audio);

    const infos = document.createElement("div");
    infos.className = "ShkoOnline.Infos";

    this.timer = document.createElement("div");
    this.timer.className = "ShkoOnline.Timer";
    this.timer.innerHTML = "00:00";

    infos.appendChild(this.timer);

    const title = document.createElement("div");
    title.className = "ShkoOnline.Title";
    title.innerText = "Audio Recording";

    infos.appendChild(title);

    this.duration = document.createElement("div");
    this.duration.className = "ShkoOnline.Duration";
    this.duration.innerText = "00:00";

    infos.appendChild(this.duration);

    this.playerContainer.appendChild(infos);

    const progress = document.createElement("div");
    progress.className = "ShkoOnline.Progress";
    progress.onclick = this.seek.bind(this);

    this.progressBar = document.createElement("div");
    this.progressBar.className = "ShkoOnline.ProgressBar";

    progress.appendChild(this.progressBar);

    this.playerContainer.appendChild(progress);

    const buttons = document.createElement("div");
    buttons.className = "ShkoOnline.Buttons";

    const rewindButton = document.createElement("div");
    rewindButton.className = "ShkoOnline.Rewind";
    rewindButton.onclick = this.rewind.bind(this);
    buttons.appendChild(rewindButton);

    this.togglePlayButton = document.createElement("div");
    this.togglePlayButton.className = "ShkoOnline.Play";
    this.togglePlayButton.onclick = this.togglePlay.bind(this);
    buttons.appendChild(this.togglePlayButton);

    const forwardButton = document.createElement("div");
    forwardButton.className = "ShkoOnline.Forward";
    forwardButton.onclick = this.forward.bind(this);
    buttons.appendChild(forwardButton);

    this.toggleMuteButton = document.createElement("div");
    this.toggleMuteButton.className = "ShkoOnline.Sound";
    this.toggleMuteButton.onclick = this.toggleMute.bind(this);
    buttons.appendChild(this.toggleMuteButton);

    this.playerContainer.appendChild(buttons);

    container.appendChild(this.playerContainer);

    if (this.audioSource.getAttribute("src") !== "") {
      this.audio.load();
    }
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this.playerContainer.className = context.mode.isVisible ? "ShkoOnline.Player" : "ShkoOnline.Player ShkoOnline.Hidden";

    if (this.audioSource.getAttribute("src") !== context.parameters.src.raw) {
      this.audioSource.setAttribute("src", context.parameters.src.raw || "");
      this.audio.load();
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
      this.togglePlayButton.className = "ShkoOnline.Play";
    }
  }

  private togglePlay() {
    if (this.audio.error) return;
    if (this.audio.paused) {
      this.togglePlayButton.className = "ShkoOnline.Pause";
      this.audio.play();
    } else {
      this.togglePlayButton.className = "ShkoOnline.Play";
      this.audio.pause();
    }
  }
  private toggleMute() {
    if (this.audio.error) return;
    if (this.audio.muted == false) {
      this.audio.muted = true;
      this.toggleMuteButton.className = "ShkoOnline.NoSound";
    } else {
      this.audio.muted = false;
      this.toggleMuteButton.className = "ShkoOnline.Sound";
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
