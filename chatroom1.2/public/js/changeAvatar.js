let uploadImgBtn = document.getElementById('uploadImgBtn');
let uploadFileInput = document.getElementById('uploadFileInput');
let chooseFile = null;
uploadFileInput.addEventListener('change', function (event) {
  chooseFile = event.target.files[0];

  let imgUrl = URL.createObjectURL(chooseFile);
  console.log(imgUrl);

  let img = document.createElement('img');
  img.src = imgUrl;
  img.classList.add('previewAvatar');

  preview.innerHTML = '';
  preview.appendChild(img);
});

uploadImgBtn.addEventListener('click', function () {
  let formData = new FormData();
  if (!chooseFile) {
    alert('请上传一张图片');
    return;
  }
  formData.append('file', chooseFile, chooseFile.name);
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log(xhr.responseText);
      axios.post("/changeAvatar", {
        avatar: xhr.responseText
      }).then(res => {
        console.log(res);
        let err_code = res.data.err_code;
        if(err_code === 0) {
          location.href = '/index';
        } else if (err_code === 1) {
          alert('更新头像失败');
        }
      })
    }
  };
  xhr.open('POST', 'http://8.131.68.141:9400/oss/fileUpload');
  xhr.send(formData);
});
