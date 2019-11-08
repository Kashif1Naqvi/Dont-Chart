const form = document.querySelector("form")
const name = document.querySelector('#name')
const cost = document.querySelector("#cost")
const error = document.querySelector("#error")


form.addEventListener("submit",(e)=>{
  e.preventDefault()
  if(name.value && cost.value){
    let item = {
      name : name.value,
      cost: cost.value
    }
    db.collection("expenses").add(item).then(e=>{
      name.value = "";
      cost.value = "";
      error.textContent = "";
    })
  }
  else 
  {
    error.textContent = "Please Enter Value Before Adding Items"
  }
})
