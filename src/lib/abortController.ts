class YoutubeAbortController {
  private aborted = false;

  abort() {
    this.aborted = true;
  }

  reset() {
    this.aborted = false;
  }

  isAborted() {
    return this.aborted;
  }
}

export const youtubeAbort = new YoutubeAbortController();
