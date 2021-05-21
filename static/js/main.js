const dictiionary_app = (() => {
  window.addEventListener("load", () => {
    const form = document.getElementById("word-form")
    const word_index = document.getElementById("word-index")
    const word_add = document.getElementById("word-add")
    const cancel = document.getElementById("cancel")
    const del = document.querySelectorAll(".delete")
    const edit = document.querySelectorAll(".edit")
    const edit_word = document.querySelectorAll(".edit-word")
    const edit_meaning = document.querySelectorAll(".edit-meaning")
    const edit_submit = document.querySelectorAll(".edit-submit")
    const edit_form = document.querySelectorAll("table form")
    const edit_cancel = document.querySelectorAll(".edit-cancel")
    const flash_message = document.querySelector("#myModal")
    const profile_form = document.querySelector("#profile-form")
    const profile_cancel = document.querySelector("#profile-cancel")
    const profile_submit = document.querySelector("#profile-submit")
    const logo_profile = document.querySelector("#logo-profile")
    
    // modal box close buttons
    const close_modal = document.querySelectorAll("#myModal button")
    if(close_modal){
      close_modal.forEach(element => element.addEventListener("click", () => document.querySelector("#myModal").remove()))
    }
    
    // show flash messages when input is incorrect
    if(flash_message){
      flash_message.style.display = "block"
    }
    
    // add listener to word index link
    if(word_index){
      word_index.addEventListener("click", reload_page)
    }
    // add listener to cancel button in the form
    if(cancel){
      cancel.addEventListener("click", reload_page)
    }
    
    // add click listeners to word add link
    if(word_add){
      word_add.addEventListener("click", ()=>{
        word_index.classList.remove("side-active")
        word_add.classList.add("side-active")
        form.style.display = "block"
        document.getElementById("word").focus()
      })
    }
    
    // Reload page
    function reload_page(){
      location.reload()
    }
    
    // Adding a new word operations
    if(form){
      // hide the form to add a word
      form.style.display = "none"
      // insertion of word to database
      form.addEventListener("submit", (event) => {
        event.preventDefault()
        
        let word = document.getElementById("word").value.trim()
        let meaning = document.getElementById("meaning").value.trim()
        
        fetch("/word", {
          method: "POST",
          body: JSON.stringify({
            word: word,
            meaning: meaning
          }),
          headers: {
            "Content-Type": "application/json, charset=UTF-8",
            "Accept": "application/json"
          }
        })
        .then(response => response.json())
        .then(data => {
            reload_page()
          })
          .catch(error => {
            console.log(`Error: ${error}`)
          })
        })
    }
      
    // Delete operation for a word in the database
    if(del){
      del.forEach(element => element.addEventListener("click", (event) => {
        event.preventDefault()
        
        let word_id = element.id
        
        fetch(`word/${word_id}/delete`, {
          method: "POST",
        })
        .then(response => response.json())
        .then(data => {
          reload_page()
        })
        .catch(error => {
          console.log(`Error: ${error}`)
        })
      }))
    }
      
    // Update operation for a word in the database
    if(edit){
        edit.forEach(element => element.addEventListener("click", (event) => {
        event.preventDefault()
        //get the parent element and the row element
        let td_parent = element.parentNode.parentNode
        let parent = element.parentNode
        
        // get the hidden input and textarea elements
        let word = td_parent.querySelector(".edit-word")
        let meaning = td_parent.querySelector(".edit-meaning")
        // hide the word and meaning table data element
        let word_to_hide = td_parent.querySelector(".word-word")
        let meaning_to_hide = td_parent.querySelector(".word-meaning")
        let word_val = word_to_hide.textContent
        let meaning_val = meaning_to_hide.textContent
        word_to_hide.style.display = "none"
        meaning_to_hide.style.display = "none"
        // display hidden input and textarea elements
        let display = "table-cell"
        word.style.display = display
        meaning.style.display = display
        word.querySelector("input").value = word_val
        meaning.querySelector("textarea").value = meaning_val
        // hide the edit and delete buttons
        parent.style.display = "none"
        td_parent.querySelector(".delete").parentNode.style.display = "none"
        // show the hidden submit and cancel buttons
        td_parent.querySelector(".edit-submit").parentNode.style.display = display
        td_parent.querySelector(".edit-cancel").parentNode.style.display = display
      }))
    }
    // edit operations
    // hide the edit text input
    if(edit_word){
      edit_word.forEach(element => element.style.display = "none")
    }
    // hide the edit textarea
    if(edit_meaning){
      edit_meaning.forEach(element => element.style.display = "none")
    }
    // hide the edit submit button
    if(edit_submit){
      edit_submit.forEach(element => element.parentNode.style.display = "none")
    }
    if(edit_cancel){
      // give event listener to the cancel button in the table
      edit_cancel.forEach(element => element.addEventListener("click", reload_page))
      // hide the edit cancel button
      edit_cancel.forEach(element => element.parentNode.style.display = "none")
    }
    // give event listener to the submit button in the table
    if(edit_form){
      edit_form.forEach(element => element.addEventListener("submit", (event) => {
        event.preventDefault()
        //get the parent element and the row element
        let td_parent = element.parentNode
        
        let word = td_parent.querySelector("input").value.trim()
        let meaning = td_parent.querySelector("textarea").value.trim()
        let word_id = td_parent.querySelector(".edit-submit").id
        
        fetch(`/word/${word_id}/edit`, {
          method: "POST",
                body: JSON.stringify({
                  word: word,
                  meaning: meaning
                }),
                headers: {
                  "Content-Type": "application/json, charset=UTF-8",
                  "Accept": "application/json"
                }
          })
          .then(response => response.json())
          .then(data => {
            reload_page()
          })
          .catch(error => {
            console.log(`Error: ${error}`)
          })
      }))
    }
    
    // profile operations
    // hide profile display form
    if(profile_form){
      // hide the form
      profile_form.style.display = "none"

      // submit the profile form
      profile_form.addEventListener("submit", (event) => {
        event.preventDefault()
        // get the image
        let image = profile_form.querySelector("input").files[0]
        let body = new FormData()
        body.append("file", image)
        fetch("/upload", {
          method: "POST",
          body: body
        })
        .then(response => response.json())
        .then(data => {
            reload_page()
          })
        .catch(error => {
          console.log(`Error: ${error}`)
        })
      })
    }
    // add listener to cancel button in the form
    if(profile_cancel){
      profile_cancel.addEventListener("click", reload_page)
    }
    // add click listeners to profile link
    if(logo_profile){
      logo_profile.addEventListener("click", () => {
        // remove the active class from the links and add active class to the profile link
        word_index.classList.remove("side-active")
        word_add.classList.remove("side-active")
        logo_profile.classList.add("side-active")
        // show the profile form and hide the other forms
        profile_form.style.display = "block"
        form.style.display = "none"
      })
    }
  })
})()