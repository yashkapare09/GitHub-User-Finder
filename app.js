
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");
const profileContainer = document.getElementById("profile-container");
const errorContainer = document.getElementById("error-container");

const avatar = document.getElementById("avatar");
const nameElement = document.getElementById("name");
const usernameElement = document.getElementById("username");
const bioElement = document.getElementById("bio");
const locationElement = document.getElementById("location");
const joinedDateElement = document.getElementById("joined-date");
const profileLink = document.getElementById("profile-link");

const followers = document.getElementById("followers");
const following = document.getElementById("following");
const reposCount = document.getElementById("repos");

const companyElement = document.getElementById("company");
const blogElement = document.getElementById("blog");
const twitterElement = document.getElementById("twitter");

const companyContainer = document.getElementById("company-container");
const blogContainer = document.getElementById("blog-container");
const twitterContainer = document.getElementById("twitter-container");

const reposContainer = document.getElementById("repos-container");

const GITHUB_API_URL = "https://api.github.com/users/";


searchBtn.addEventListener("click", () => {
  const username = searchInput.value.trim();
  if (!username) {
    showError("Please enter a username.");
    return;
  }
  fetchGitHubUser(username);
});


searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});


async function fetchGitHubUser(username) {

  clearProfile();
  hideError();
  showLoadingRepos();

  try {
    const response = await fetch(GITHUB_API_URL + username);

    if (!response.ok) {
   
      showError("No user found. Please try another username.");
      hideProfile();
      return;
    }

    const data = await response.json();
   
    renderProfile(data);
  
    fetchUserRepos(username);
  } catch (error) {
    console.error(error);
    showError("Something went wrong. Please try again later.");
    hideProfile();
  }
}


async function fetchUserRepos(username) {
  try {
    const response = await fetch(
      `${GITHUB_API_URL}${username}/repos?sort=updated&per_page=6`
    );

    if (!response.ok) {
      showReposError("Unable to load repositories.");
      return;
    }

    const repos = await response.json();
    renderRepos(repos);
  } catch (error) {
    console.error(error);
    showReposError("Unable to load repositories.");
  }
}


function renderProfile(user) {
  profileContainer.classList.remove("hidden");

  avatar.src = user.avatar_url;
  avatar.alt = `${user.login}'s avatar`;

  nameElement.textContent = user.name || "No name provided";
  usernameElement.textContent = `@${user.login}`;
  bioElement.textContent = user.bio || "This user has no bio.";

  if (user.location) {
    locationElement.textContent = user.location;
  } else {
    locationElement.textContent = "Not specified";
  }


  if (user.created_at) {
    const joinedDate = new Date(user.created_at);
    joinedDateElement.textContent = joinedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } else {
    joinedDateElement.textContent = "";
  }


  profileLink.href = user.html_url;
  profileLink.textContent = "View Profile";


  followers.textContent = user.followers;
  following.textContent = user.following;
  reposCount.textContent = user.public_repos;


  if (user.company) {
    companyContainer.style.display = "flex";
    companyElement.textContent = user.company;
  } else {
    companyContainer.style.display = "none";
  }


  if (user.blog) {
    blogContainer.style.display = "flex";
    let blogUrl = user.blog;

    if (!blogUrl.startsWith("http")) {
      blogUrl = "https://" + blogUrl;
    }
    blogElement.href = blogUrl;
    blogElement.textContent = blogUrl;
  } else {
    blogContainer.style.display = "none";
  }


  if (user.twitter_username) {
    twitterContainer.style.display = "flex";
    const twitterUrl = `https://twitter.com/${user.twitter_username}`;
    twitterElement.href = twitterUrl;
    twitterElement.textContent = `@${user.twitter_username}`;
  } else {
    twitterContainer.style.display = "none";
  }
}


function renderRepos(repos) {
  reposContainer.innerHTML = ""; 

  if (!repos || repos.length === 0) {
    const noRepo = document.createElement("p");
    noRepo.textContent = "No public repositories found.";
    noRepo.classList.add("no-repos");
    reposContainer.appendChild(noRepo);
    return;
  }

  repos.forEach((repo) => {
    const repoCard = document.createElement("div");
    repoCard.classList.add("repo-card");

    repoCard.innerHTML = `
      <h4 class="repo-name">
        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
      </h4>
      <p class="repo-desc">
        ${repo.description ? repo.description : "No description provided."}
      </p>
      <div class="repo-meta">
        <span>${repo.language ? repo.language : "Unknown language"}</span>
        <span>★ ${repo.stargazers_count}</span>
      </div>
    `;

    reposContainer.appendChild(repoCard);
  });
}

function showLoadingRepos() {
  reposContainer.innerHTML =
    '<div class="loading-repos">Loading repositories...</div>';
}


function showError(message) {
  errorContainer.textContent = message;
  errorContainer.classList.remove("hidden");
}


function hideError() {
  errorContainer.classList.add("hidden");
}


function showReposError(message) {
  reposContainer.innerHTML = `<p class="repos-error">${message}</p>`;
}


function clearProfile() {
  avatar.src = "";
  nameElement.textContent = "";
  usernameElement.textContent = "";
  bioElement.textContent = "";
  locationElement.textContent = "";
  joinedDateElement.textContent = "";
  profileLink.removeAttribute("href");

  followers.textContent = "";
  following.textContent = "";
  reposCount.textContent = "";

  companyElement.textContent = "";
  blogElement.textContent = "";
  twitterElement.textContent = "";

  reposContainer.innerHTML = "";
}


function hideProfile() {
  profileContainer.classList.add("hidden");
}
