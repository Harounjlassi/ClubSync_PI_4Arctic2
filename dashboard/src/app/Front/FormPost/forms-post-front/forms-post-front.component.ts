import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from 'app/models/Comment.model';
import { ForumPost } from 'app/models/ForumPost.model';
import { React, ReactType } from 'app/models/React.model';
import { User } from 'app/models/user.model';
import { CommentService } from 'app/services/comment.service';
import { ForumPostService } from 'app/services/forum-post.service';
import { ReactService } from 'app/services/react.service';

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

  constructor(
    private ForumService: ForumPostService,
    private commentService: CommentService,
    private fb: FormBuilder,
    private reactService: ReactService,
  ) {

    this.postForm = this.fb.group({
      content: ['', Validators.required],
      imageBase64: ['']
    });
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.ForumService.getAllForumPosts().subscribe(
      posts => {
        this.forumPosts = posts;
        // Load reacts for each post
        this.forumPosts.forEach(post => {
          this.loadPostReacts(post.id_post);
        });
        this.isLoading = false;
      },
      error => {
        console.error('Error loading posts:', error);
        this.isLoading = false;
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

    const postData: Partial<ForumPost> = {
      content: this.postForm.value.content,
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

    const newComment: Comment = {
      content: commentText,
      author: this.currentUser,
      forumPost: { id_post: postId } as ForumPost,
      commentDate: new Date(),
      idComment: null
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
}
