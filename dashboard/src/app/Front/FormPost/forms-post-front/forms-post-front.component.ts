import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Comment } from 'app/models/Comment.model';
import { ForumPost } from 'app/models/ForumPost.model';
import { React, ReactType } from 'app/models/React.model';
import { Reply } from 'app/models/Reply.model';
import { User } from 'app/models/user.model';
import { CommentService } from 'app/services/comment.service';
import { ForumPostService } from 'app/services/forum-post.service';
import { ReactService } from 'app/services/react.service';
import { ReplyService } from 'app/services/reply.service';
import { Filter } from 'bad-words';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-forms-post-front',
  templateUrl: './forms-post-front.component.html',
  styleUrls: ['./forms-post-front.component.scss']
})
export class FormsPostFrontComponent implements OnInit {
  forumPosts: ForumPost[] = [];
  isLoading = true;
  currentPostId: number | null = null;
  isEditMode = false;
  @ViewChild('postModal') postModal!: ElementRef;
  imagePreview: string | ArrayBuffer | null = null;
  newComments: { [postId: number]: string } = {};

  ReactType = ReactType; // Make enum available in template
  userReacts: { [postId: number]: React } = {};
  reactCounts: { [postId: number]: { [type: string]: number } } = {};

  filter = new Filter();

  currentUser: User = {
    id: 1,
    firstname: 'test',
    lastname: 'test',
    dateOfBirth: '',
    email: '',
    password: '',
    accountLocked: false,
    enabled: false,
    createdDate: '',
    lastModifiedDate: '',
    role: undefined
  };
  postForm: FormGroup;
  newReplies: { [commentId: number]: string } = {};
  showReplyForms: { [commentId: number]: boolean } = {};
  reactIcons = {
    [ReactType.LIKE]: '👍',
    [ReactType.LOVE]: '❤️',
    [ReactType.HAHA]: '😂',
    [ReactType.WOW]: '😮',
    [ReactType.SAD]: '😢',
    [ReactType.ANGRY]: '😡'
  };

  constructor(
    private ForumService: ForumPostService,
    private commentService: CommentService,
    private fb: FormBuilder,
    private reactService: ReactService,
    private replyService: ReplyService,
    private sanitizer: DomSanitizer

  ) {

    this.postForm = this.fb.group({
      content: ['', Validators.required],
      imageBase64: [''],
      search: ['']
    });
  }
  searchTerm: string = '';
  originalForumPosts: ForumPost[] = []; // To store original posts for resetting
  expandedPosts: { [postId: number]: boolean } = {}; // Track which posts have expanded comments
  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most_reactions', label: 'Most Reactions' },
    { value: 'most_comments', label: 'Most Comments' }
  ];
  selectedSort = 'newest';
  
  // Add this method to sort posts
  sortPosts(): void {
    switch(this.selectedSort) {
      case 'newest':
        this.forumPosts.sort((a, b) => 
          new Date(b.post_date).getTime() - new Date(a.post_date).getTime()
        );
        break;
        
      case 'oldest':
        this.forumPosts.sort((a, b) => 
          new Date(a.post_date).getTime() - new Date(b.post_date).getTime()
        );
        break;
        
      case 'most_reactions':
        this.forumPosts.sort((a, b) => {
          const aReactions = this.getTotalReactions(a.id_post);
          const bReactions = this.getTotalReactions(b.id_post);
          return bReactions - aReactions;
        });
        break;
        
      case 'most_comments':
        this.forumPosts.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
        break;
    }
  }

  getTotalReactions(postId: number): number {
    if (!this.reactCounts[postId]) return 0;
    return Object.values(this.reactCounts[postId]).reduce((sum, count) => sum + count, 0);
  }

  toggleCommentExpansion(postId: number): void {
    this.expandedPosts[postId] = !this.expandedPosts[postId];
  }

  onSearchInput(): void {
    this.searchTerm = this.postForm.get('search')?.value || '';
    this.filterPosts();
  }

  clearSearch(): void {
    this.postForm.get('search')?.setValue('');
    this.searchTerm = '';
    this.filterPosts();
  }
  // Add this method to your component class
  filterPosts(): void {
    if (!this.searchTerm.trim()) {
      this.forumPosts = [...this.originalForumPosts];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();

    this.forumPosts = this.originalForumPosts.filter(post => {
      // Check post content
      const postMatches = post.content.toLowerCase().includes(searchTermLower);

      // Check comments
      const commentMatches = post.comments?.some((comment: any) =>
        comment.content.toLowerCase().includes(searchTermLower)
      );

      // Check replies
      const replyMatches = post.comments?.some((comment: any) =>
        comment.replies?.some(reply =>
          reply.content.toLowerCase().includes(searchTermLower)
        )
      );

      return postMatches || commentMatches || replyMatches;
    });
  }

  ngOnInit(): void {
    this.loadPosts();

    this.postForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.filterPosts();
      });

  }

  loadPosts(): void {
    this.isLoading = true;
    this.ForumService.getAllForumPosts().subscribe(
      posts => {
        this.forumPosts = posts;
        this.originalForumPosts = [...posts];
        this.sortPosts();
        // Load reacts for each post
        this.forumPosts.forEach(post => {
          this.loadPostReacts(post.id_post);
          if (post.comments) {
            post.comments.forEach((comment: any) => {
              this.loadRepliesForComment(comment.id_comment);
            });
          }
        });
        this.isLoading = false;
      },
      error => {
        console.error('Error loading posts:', error);
        this.isLoading = false;
      }
    );
  }

  loadRepliesForComment(commentId: number): void {
    this.replyService.getRepliesByComment(commentId).subscribe(
      replies => {
        const comment = this.findCommentById(commentId);
        if (comment) {
          comment.replies = replies;
        }
      },
      error => {
        console.error('Error loading replies:', error);
      }
    );
  }

  loadPostReacts(postId: number): void {
    this.reactService.getReactsByPost(postId).subscribe({
      next: (reacts) => {
        if (!this.reactCounts[postId]) this.reactCounts[postId] = {};

        // Count reacts by type
        Object.values(ReactType).forEach(type => {
          this.reactCounts[postId][type] = reacts.filter(r => r.type === type).length;
        });
      },
      error: (err) => console.error('Error loading reacts:', err)
    });
  }

  toggleReplyForm(commentId: number): void {
    this.showReplyForms[commentId] = !this.showReplyForms[commentId];
  }

  addReply(commentId: number): void {
    const replyText = this.newReplies[commentId];
    if (!replyText || !this.currentUser) return;

    this.commentService.getCommentById(commentId).subscribe(
      (comment) => {
        if (!comment) return;

        const cleanContent = this.filter.clean(replyText);

        const newReply: Reply = {
          content: cleanContent,
          author: this.currentUser,
          replyDate: new Date(),
          comment: comment,
          idReply: null
        };

        console.log(newReply)

        this.replyService.createReply(newReply).subscribe(
          (createdReply) => {
            if (!comment.replies) {
              comment.replies = [];
            }
            comment.replies.push(createdReply);
            this.newReplies[commentId] = '';
            this.showReplyForms[commentId] = false;
            this.loadPosts()
          },
          (error) => {
            console.error('Error creating reply:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching comment:', error);
      }
    );
  }


  private findCommentById(commentId: number): Comment | undefined {
    this.commentService.getCommentById(commentId).subscribe(
      (comment) => {
        if (comment) {
          console.log('Comment found:', comment);
          return comment
        } else {
          console.log('Comment not found');
          return undefined
        }
      },
      (error) => {
        console.error('Error fetching comment:', error);
        return undefined
      }
    );
    return undefined
  }

  deleteReply(replyId: number, commentId: number): void {
    this.replyService.deleteReply(replyId).subscribe(
      () => {
        const comment = this.findCommentById(commentId);
        if (comment && comment.replies) {
          comment.replies = comment.replies.filter(r => r.idReply !== replyId);
        }
      },
      error => {
        console.error('Error deleting reply:', error);
      }
    );
  }

  openCreateModal(): void {

    this.postModal.nativeElement.classList.add('show');
    this.postModal.nativeElement.style.display = 'block';
    document.body.classList.add('modal-open');
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop', 'fade', 'show');
    document.body.appendChild(backdrop);
  }

  closeModal() {
    this.postModal.nativeElement.classList.remove('show');
    this.postModal.nativeElement.style.display = 'none';
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }


  onSubmit(): void {
    if (this.postForm.invalid) {
      return;
    }

    const cleanContent = this.filter.clean(this.postForm.value.content);

    const postData: Partial<ForumPost> = {
      content: cleanContent,
      post_date: new Date(),
      imageBase64: this.imagePreview ? this.imagePreview : "",
      author: {
        id: 1,
        firstname: 'test',
        lastname: 'test',
        dateOfBirth: '',
        email: '',
        password: '',
        accountLocked: false,
        enabled: false,
        createdDate: '',
        lastModifiedDate: '',
        role: undefined
      } // Replace with current user ID
    };


    if (this.isEditMode && this.currentPostId) {
      this.ForumService.updateForumPost({
        ...postData,
        imageBase64: this.imagePreview ? this.imagePreview : "", post_date: new Date(), id_post: this.currentPostId
      } as ForumPost).subscribe(
        () => {
          this.loadPosts();
          this.closeModal()

        },
        error => {
          console.error('Error updating post:', error);
        }
      );
    } else {
      this.ForumService.createForumPost(postData as ForumPost).subscribe(
        () => {
          this.loadPosts();
          this.closeModal()
        },
        error => {
          console.error('Error creating post:', error);
        }
      );
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.postForm.patchValue({
          imageBase64: reader.result?.toString().split(',')[1] // Get only the base64 part
        });
      };
      reader.readAsDataURL(file);
    }
  }



  removeImage() {
    this.imagePreview = null;
    this.postForm.patchValue({
      imageBase64: ''
    });
    // Reset the file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  // Update the addComment method in your component
  addComment(postId: number): void {
    const commentText = this.newComments[postId];
    if (!commentText || !this.currentUser) return;

    const cleanContent = this.filter.clean(commentText);

    const newComment: Comment = {
      content: cleanContent,
      author: this.currentUser,
      forumPost: { id_post: postId } as ForumPost,
      comment_date: new Date(),
      id_comment: null
    };

    this.commentService.createComment(newComment).subscribe(
      (createdComment: any) => {
        const post = this.forumPosts.find(p => p.id_post === postId);
        if (post) {
          if (!post.comments) {
            post.comments = [];
          }
          post.comments.unshift(createdComment);
          this.loadPosts();
          this.newComments[postId] = '';
        }
      },
      error => {
        console.error('Error creating comment:', error);
      }
    );
  }
  toggleReact(postId: number, reactType: ReactType): void {
    const existingReact = this.userReacts[postId];

    if (existingReact && existingReact.type === reactType) {
      // Remove react if same type clicked again
      this.removeReact(postId, existingReact.id_react!);
    } else if (existingReact) {
      // Update react if different type clicked
      this.updateReact(postId, existingReact.id_react!, reactType);
    } else {
      // Add new react
      this.addReact(postId, reactType);
    }
  }

  addReact(postId: number, reactType: ReactType): void {
    const newReact: React = {
      type: reactType,
      author: this.currentUser,
      forumPost: { id_post: postId } as ForumPost,
      react_date: new Date()
    };

    this.reactService.addReact(newReact).subscribe({
      next: (react) => {
        this.userReacts[postId] = react;
        this.updateReactCounts(postId);
      },
      error: (err) => console.error('Error adding react:', err)
    });
  }

  updateReact(postId: number, reactId: number, newType: ReactType): void {
    const updatedReact = {
      ...this.userReacts[postId],
      type: newType,
      id_react: reactId
    };

    this.reactService.updateReact(updatedReact).subscribe({
      next: (react) => {
        this.userReacts[postId] = react;
        this.updateReactCounts(postId);
        // Optional: Show success feedback
        console.log('React updated successfully');
      },
      error: (err) => {
        console.error('Error updating react:', err);
        // Optional: Show error feedback
      }
    });
  }

  removeReact(postId: number, reactId: number): void {
    this.reactService.removeReact(reactId).subscribe({
      next: () => {
        delete this.userReacts[postId];
        this.updateReactCounts(postId);
      },
      error: (err) => console.error('Error removing react:', err)
    });
  }

  updateReactCounts(postId: number): void {
    Object.values(ReactType).forEach(type => {
      this.reactService.countReactsByType(postId, type).subscribe(count => {
        if (!this.reactCounts[postId]) this.reactCounts[postId] = {};
        this.reactCounts[postId][type] = count;
      });
    });
  }

  getUserReactType(postId: number): ReactType | null {
    return this.userReacts[postId]?.type || null;
  }

  

  parseMentions(content: string): SafeHtml {
    // Regular expression to find @mentions
    const mentionRegex = /@(\w+)/g;
    
    // Replace mentions with clickable links if user exists
    const parsedContent = content.replace(mentionRegex, (match, username) => {
      const userExists = true;
      if (userExists) {
        return `<a href="/profile/${username}" class="mention" style="color: #2563eb; cursor: pointer;">@${username}</a>`;
      }
      return match; // Return original if user doesn't exist
    });
  
    return this.sanitizer.bypassSecurityTrustHtml(parsedContent);
  }
  
}
