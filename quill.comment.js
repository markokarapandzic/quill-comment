/*
* to be used with browerify, included this.quill module
*/
var Parchment = Quill.import('parchment');
var Delta = require('quill-delta');

let CommentAttr = new Parchment.Attributor.Attribute('comment', 'ql-comment', {
  scope: Parchment.Scope.INLINE
});

let CommentAuthorAttr = new Parchment.Attributor.Attribute('commentAuthor', 'ql-comment-author', {
  scope: Parchment.Scope.INLINE
});

let CommentTimestampAttr = new Parchment.Attributor.Attribute('commentTimestamp', 'ql-comment-timestamp', {
  scope: Parchment.Scope.INLINE
});

let CommentId = new Parchment.Attributor.Attribute('commentId', 'id', {
  scope: Parchment.Scope.INLINE
});

let CommentAddOnAttr = new Parchment.Attributor.Attribute('commentAddOn', 'ql-comment-addon', {
  scope: Parchment.Scope.INLINE
});



class QuillComment {
  constructor(ql, opt) {
    this.quill = ql;
    this.options = opt;

    this.isEnabled;
	
    if(this.options.enabled) {
      this.enable();
	    this.isEnabled = true;
    }
    if(!this.options.commentAuthorId) {
      return;
    }

    Quill.register(CommentId, true);
    Quill.register(CommentAttr, true);
    Quill.register(CommentAuthorAttr, true);
    Quill.register(CommentTimestampAttr, true);
    Quill.register(CommentAddOnAttr, true);
		
    this.addCommentStyle(this.options.color);

    let commentAddClick = this.options.commentAddClick;
    let commentsClick = this.options.commentsClick;
    let addComment = this.addComment;

  	// for comment color on/off toolbar item
  	let toolbar = this.quill.getModule('toolbar');
    if(toolbar) {
    	toolbar.addHandler('comments-toggle', function() {

      });
      toolbar.addHandler('comments-add', function() {

      });
    	let commentToggleBtn =  document.querySelector(`#${this.options.containerID} button.ql-comments-toggle`);

    	let commentObj = this;
    	commentToggleBtn.addEventListener('click', function() {
    		// toggle on/off authorship colors
        commentObj.enable(!commentObj.isEnabled);
        
        if (commentsClick) {
          commentsClick();
        }
      });
      
      let addCommentBtn = document.querySelector(`#${this.options.containerID} button.ql-comments-add`);
      addCommentBtn.addEventListener('click', () => {

        this.range = this.quill.getSelection(); 

        if (!this.range || this.range.length ==0) {
          return; // do nth, cuz nothing is selected
        }

        commentAddClick(addComment,this);
        
      })
    } else {
      console.log('Error: this.quill-comment module needs this.quill toolbar');
    }

    // to prevent comments from being copied/pasted.
    this.quill.clipboard.addMatcher('span[ql-comment]', function(node, delta) {

      delta.ops.forEach(function(op) {
        op.attributes["comment"] && delete op.attributes["comment"];
        op.attributes["commentAddOn"] && delete op.attributes["commentAddOn"];
        op.attributes["commentAuthor"] && delete op.attributes["commentAuthor"];
        op.attributes["commentId"] && delete op.attributes["commentId"];
        op.attributes["commentTimestamp"] && delete op.attributes["commentTimestamp"];
        op.attributes["background"] && delete op.attributes["background"];

      });
      return delta;
    });

  }

    addComment({comment,currentTimestamp,...rest}) {
      if (!comment) {
        return; // cannot work without comment 
      }

      // selection could be removed when this callback gets called, so store it first
      this.quill.formatText(this.range.index, this.range.length, 'commentAuthor', this.options.commentAuthorId, 'user');

      if (this.options.commentAddOn) {
        this.quill.formatText(this.range.index, this.range.length, 'commentAddOn', this.options.commentAddOn, 'user');
      }
        this.quill.formatText(this.range.index, this.range.length, 'commentTimestamp', currentTimestamp, 'user');
        this.quill.formatText(this.range.index, this.range.length, 'commentId', 'ql-comment-'+this.options.commentAuthorId+'-'+currentTimestamp, 'user');
        this.quill.formatText(this.range.index, this.range.length, 'comment', comment, 'user');
    }


  enable(enabled = true) {
    this.quill.root.classList.toggle('ql-comments', enabled);
	  this.isEnabled = enabled;
  }

  disable() {
    this.enable(false);
	  this.isEnabled = false;
  }

  addCommentStyle(color) {
    let css = ".ql-comments [ql-comment] { " + "background-color:" + color + "; }\n";
    this.addStyle(css);
  }

  addStyle(css) {
    if(!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.type = 'text/css';
	    this.styleElement.classList.add('ql-comments-style'); // in case for some manipulation
	    this.styleElement.classList.add('ql-comments-style-'+this.options.authorId); // in case for some manipulation
      document.documentElement.getElementsByTagName('head')[0].appendChild(this.styleElement);
    }
	
	  this.styleElement.innerHTML = css; // bug fix
    // this.styleElement.sheet.insertRule(css, 0);
  }
}

Comment.DEFAULTS = {
  commentAuthorId: null,
  color: 'transparent',
  enabled: false,
  commentAddClick: null,
  commentsClick: null,
  commentTimestamp: null,
  commentAddOn: null, // additional info
};

module.exports = QuillComment
