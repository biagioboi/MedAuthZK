const viewSbtButton = document.getElementById("viewSbtButton");

const loadingIndicator = document.getElementById("loading");


document.getElementById('viewSbtButton').addEventListener('click', function() {
    if (userAddress) {
      // Reindirizza alla pagina sbt-page con il parametro type=single
      window.location.href = "sbt-single.html";
    } else {
      Swal.fire({
        icon: "error",
        title: "Errore!",
        text: "Indirizzo MetaMask non trovato!",
      });
    }
  });
  
  document.getElementById('viewSbtMultiButton').addEventListener('click', function() {
    if (userAddress) {
      // Reindirizza alla pagina sbt-page con il parametro type=multi
      window.location.href = "sbt-multi.html";
    } else {
      Swal.fire({
        icon: "error",
        title: "Errore!",
        text: "Indirizzo MetaMask non trovato!",
      });
    }
  });



