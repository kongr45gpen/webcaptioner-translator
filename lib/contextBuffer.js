export default function ContextBuffer(before_count, during_count, after_count, timeout) {
    this._before_count = before_count;
    this._during_count = during_count;
    this._after_count = after_count;
    this._timeout = timeout;

    this.before = []
    this.current = []
    this.after = []

    this.last_context_taken = null;
}

ContextBuffer.prototype.toString = function () {
    return '[object ContextBuffer(' + this._before_count + ',' + this._during_count + ',' + this._after_count + ') ' + this.before.join(' ') + ', ' + this.current.join(' ') + ', ' + this.after.join(' ') + ']';
};

ContextBuffer.prototype.quickLog = function () {
    return this.before.length.toString().padStart(2, ' ') + ',' + this.current.length.toString().padStart(2, ' ') + ',' + this.after.length.toString().padStart(2, ' ');
};

ContextBuffer.prototype.addWords = function (words) {
    // Initialise timekeeping when the first word is added
    if (!this.last_context_taken) this.last_context_taken = new Date();

    this.current = this.current.concat(words);

    // If we have enough words for current...
    if (this.current.length > this._during_count) {
        // ...move the extra words to after
        this.after = this.current.slice(this._during_count);
        // ...and remove them from current
        this.current = this.current.slice(0, this._during_count);
    }

    // console.debug("Current context: ", this.toString());

    // Return whether we have enough context to display things
    return this.after.length >= this._after_count;
};

ContextBuffer.prototype.mergeAfter = function() {
    this.current = this.current.concat(this.after);
    this.after = [];
}

ContextBuffer.prototype.get = function () {
    this.last_context_taken = new Date();

    // Snapshot the current state before recycling the words
    const current_status = [this.before, this.current, this.after];

    // Append current words to before words
    this.before = this.before.concat(this.current);
    // Remove enough words from the beginning of before to have at most before_count words
    this.before = this.before.slice(-this._before_count);

    this.current = this.after;
    this.after = [];

    if (this.current.length == 0) {
        // No need to worry about empty content
        this.last_context_taken = null;
    }

    return current_status;
};

ContextBuffer.prototype.isTooLate = function () {
    return this.last_context_taken && (new Date() - this.last_context_taken) > this._timeout;
}